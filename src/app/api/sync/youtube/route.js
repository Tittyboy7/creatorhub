import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getDateRange() {
  const now = new Date();

  const endYear = now.getFullYear();
  const endMonth = now.getMonth() + 1;

  const start = new Date(endYear, endMonth - 4, 1);

  const startYear = start.getFullYear();
  const startMonth = String(start.getMonth() + 1).padStart(2, "0");
  const endMonthString = String(endMonth).padStart(2, "0");

  return {
    startDate: `${startYear}-${startMonth}-01`,
    endDate: `${endYear}-${endMonthString}-01`,
  };
}

async function refreshGoogleAccessToken(refreshToken) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
}

async function updateSyncStatus(supabaseAdmin, accountId, updates) {
  await supabaseAdmin
    .from("connected_accounts")
    .update({
      last_sync_attempt_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...updates,
    })
    .eq("id", accountId);
}

async function fetchYouTubeChannelStats(accessToken) {
  const response = await fetch(
    "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  const channel = data.items?.[0];

  if (!channel) {
    return null;
  }

  return {
    channel_id: channel.id,
    channel_title: channel.snippet?.title || "YouTube",
    subscriber_count: Number(channel.statistics?.subscriberCount || 0),
    view_count: Number(channel.statistics?.viewCount || 0),
    video_count: Number(channel.statistics?.videoCount || 0),
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");

  if (!userId) {
    return NextResponse.json({ error: "Missing user_id." }, { status: 400 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: account, error: accountError } = await supabaseAdmin
    .from("connected_accounts")
    .select("*")
    .eq("user_id", userId)
    .eq("platform", "youtube")
    .single();

  if (accountError || !account) {
    return NextResponse.json(
      { error: "No connected YouTube account found." },
      { status: 404 }
    );
  }

  await updateSyncStatus(supabaseAdmin, account.id, {
    sync_status: "syncing",
    sync_error: null,
  });

  if (!account.refresh_token) {
    await updateSyncStatus(supabaseAdmin, account.id, {
      sync_status: "error",
      sync_error: "No refresh token found. Reconnect YouTube.",
    });

    return NextResponse.json(
      { error: "No refresh token found. Reconnect YouTube." },
      { status: 400 }
    );
  }

  let freshTokenData;

  try {
    freshTokenData = await refreshGoogleAccessToken(account.refresh_token);
  } catch (error) {
    await updateSyncStatus(supabaseAdmin, account.id, {
      sync_status: "error",
      sync_error: "Failed to refresh Google access token.",
    });

    return NextResponse.json(
      {
        error: "Failed to refresh Google access token.",
        details: error.message,
      },
      { status: 500 }
    );
  }

  const freshAccessToken = freshTokenData.access_token;

  const expiresAt = new Date(
    Date.now() + Number(freshTokenData.expires_in || 3600) * 1000
  ).toISOString();

  let channelStats = null;

  try {
    channelStats = await fetchYouTubeChannelStats(freshAccessToken);
  } catch (error) {
    await updateSyncStatus(supabaseAdmin, account.id, {
      sync_status: "error",
      sync_error: "Failed to fetch YouTube channel stats.",
    });

    return NextResponse.json(
      {
        error: "Failed to fetch YouTube channel stats.",
        details: error.message,
      },
      { status: 500 }
    );
  }

  await supabaseAdmin
    .from("connected_accounts")
    .update({
      access_token: freshAccessToken,
      expires_at: expiresAt,
      account_id: channelStats?.channel_id || account.account_id,
      account_name: channelStats?.channel_title || account.account_name,
      metadata: {
        ...(account.metadata || {}),
        youtube: channelStats,
      },
      updated_at: new Date().toISOString(),
    })
    .eq("id", account.id);

  const { startDate, endDate } = getDateRange();

  const params = new URLSearchParams({
    ids: "channel==MINE",
    startDate,
    endDate,
    metrics: "estimatedRevenue",
    dimensions: "month",
  });

  const youtubeResponse = await fetch(
    `https://youtubeanalytics.googleapis.com/v2/reports?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${freshAccessToken}`,
      },
    }
  );

  const youtubeData = await youtubeResponse.json();

  if (!youtubeResponse.ok) {
    const errorMessage =
      youtubeData?.error?.message || "YouTube revenue sync failed.";

    await updateSyncStatus(supabaseAdmin, account.id, {
      sync_status: "error",
      sync_error: errorMessage,
    });

    return NextResponse.json(
      {
        error: "YouTube revenue sync failed.",
        details: youtubeData,
      },
      { status: youtubeResponse.status }
    );
  }

  const rows = youtubeData.rows || [];

  const revenueRows = rows.map(([month, amount]) => ({
    user_id: userId,
    platform: "YouTube",
    revenue_type: "Ads",
    amount: Number(amount || 0),
    entry_month: month.slice(0, 7),
    notes: "Synced from YouTube Analytics",
    source_platform: "youtube",
    source_entry_id: `youtube-ads-${month.slice(0, 7)}`,
    synced_from_api: true,
    synced_at: new Date().toISOString(),
  }));

  if (revenueRows.length > 0) {
    const { error: insertError } = await supabaseAdmin
      .from("revenue_entries")
      .upsert(revenueRows, {
        onConflict: "user_id,source_platform,source_entry_id",
      });

    if (insertError) {
      await updateSyncStatus(supabaseAdmin, account.id, {
        sync_status: "error",
        sync_error: insertError.message,
      });

      return NextResponse.json(
        {
          error: "Failed to insert YouTube revenue entries.",
          details: insertError.message,
        },
        { status: 500 }
      );
    }
  }

  await updateSyncStatus(supabaseAdmin, account.id, {
    last_synced_at: new Date().toISOString(),
    sync_status: "connected",
    sync_error: null,
  });

  return NextResponse.json({
    success: true,
    message: "YouTube revenue and channel stats sync completed.",
    imported_rows: revenueRows.length,
    channel_stats: channelStats,
    date_range: {
      startDate,
      endDate,
    },
  });
}