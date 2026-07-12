import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOwnedConnectedAccount } from "@/lib/integrations/core/getOwnedConnectedAccount";

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function getDateRange() {
  const end = new Date();

  const start = new Date(end);
  start.setMonth(start.getMonth() - 4);
  start.setDate(1);

  return {
    startDate: formatDate(start),
    endDate: formatDate(end),
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
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok || !data.access_token) {
    throw new Error("Google could not refresh the YouTube access token.");
  }

  return data;
}

async function updateSyncStatus(supabaseAdmin, accountId, userId, updates) {
  const { error } = await supabaseAdmin
    .from("connected_accounts")
    .update({
      last_sync_attempt_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...updates,
    })
    .eq("id", accountId)
    .eq("user_id", userId)
    .eq("platform", "youtube");

  if (error) {
    console.error("Failed to update YouTube sync status:", error);
  }
}

async function fetchYouTubeChannelStats(accessToken, expectedChannelId) {
  const response = await fetch(
    "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message || "Failed to fetch YouTube channel statistics."
    );
  }

  const channels = data.items || [];

  const channel = channels.find(
    (item) => item.id === expectedChannelId
  );

  if (!channel) {
    throw new Error(
      "The connected YouTube channel could not be verified. Reconnect this channel and try again."
    );
  }

  return {
    channel_id: channel.id,
    channel_title: channel.snippet?.title || "YouTube",
    subscriber_count: Number(channel.statistics?.subscriberCount || 0),
    view_count: Number(channel.statistics?.viewCount || 0),
    video_count: Number(channel.statistics?.videoCount || 0),
  };
}

async function fetchYouTubeRevenue({
  accessToken,
  startDate,
  endDate,
}) {
  const params = new URLSearchParams({
    ids: "channel==MINE",
    startDate,
    endDate,
    metrics: "estimatedRevenue",
    dimensions: "month",
  });

  const response = await fetch(
    `https://youtubeanalytics.googleapis.com/v2/reports?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message || "Failed to retrieve YouTube revenue."
    );
  }

  return data.rows || [];
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const connectedAccountId = body.connectedAccountId;

  if (!connectedAccountId) {
    return NextResponse.json(
      { error: "Missing connected account ID." },
      { status: 400 }
    );
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (
    !supabaseUrl ||
    !serviceRoleKey ||
    !clientId ||
    !clientSecret
  ) {
    return NextResponse.json(
      { error: "The YouTube integration is not configured correctly." },
      { status: 500 }
    );
  }

  /*
   * Verify the signed-in CreatorsHub user from the server-side session.
   * No user ID is accepted from query parameters or the request body.
   */
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "You must be signed in to sync YouTube." },
      { status: 401 }
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  /*
   * Ownership is enforced with the authenticated user ID.
   * The service-role client is never allowed to select an arbitrary user's row.
   */
  let account;

  try {
    account = await getOwnedConnectedAccount({
      supabaseAdmin,
      connectedAccountId,
      userId: user.id,
      platform: "youtube",
    });
  } catch (error) {
    console.error("Failed to retrieve YouTube connection:", error);

    return NextResponse.json(
      { error: "CreatorsHub could not retrieve the YouTube connection." },
      { status: 500 }
    );
  }

  if (!account) {
    return NextResponse.json(
      { error: "No connected YouTube account was found." },
      { status: 404 }
    );
  }

  await updateSyncStatus(supabaseAdmin, account.id, user.id, {
    sync_status: "syncing",
    sync_error: null,
  });

  if (!account.refresh_token) {
    await updateSyncStatus(supabaseAdmin, account.id, user.id, {
      sync_status: "error",
      sync_error: "No refresh token found. Reconnect YouTube.",
    });

    return NextResponse.json(
      { error: "Reconnect YouTube before syncing again." },
      { status: 400 }
    );
  }

  let freshTokenData;

  try {
    freshTokenData = await refreshGoogleAccessToken(account.refresh_token);
  } catch (error) {
    console.error("YouTube token refresh failed:", error);

    await updateSyncStatus(supabaseAdmin, account.id, user.id, {
      sync_status: "error",
      sync_error: "Failed to refresh the Google access token.",
    });

    return NextResponse.json(
      { error: "YouTube authentication expired. Reconnect and try again." },
      { status: 502 }
    );
  }

  const freshAccessToken = freshTokenData.access_token;

  const expiresAt = new Date(
    Date.now() + Number(freshTokenData.expires_in || 3600) * 1000
  ).toISOString();

  let channelStats;

  try {
    channelStats = await fetchYouTubeChannelStats(
      freshAccessToken,
      account.account_id
    );
  } catch (error) {
    console.error("YouTube channel sync failed:", error);

    await updateSyncStatus(supabaseAdmin, account.id, user.id, {
      sync_status: "error",
      sync_error: "Failed to retrieve YouTube channel statistics.",
    });

    return NextResponse.json(
      { error: "YouTube channel statistics could not be retrieved." },
      { status: 502 }
    );
  }

  const { startDate, endDate } = getDateRange();

  const warnings = [];
  let revenueRows = [];

  try {
    revenueRows = await fetchYouTubeRevenue({
      accessToken: freshAccessToken,
      startDate,
      endDate,
    });
  } catch (error) {
    console.warn("YouTube revenue was unavailable:", error);

    warnings.push(
      "YouTube revenue was unavailable, but channel statistics synced successfully."
    );

    revenueRows = [];
  }

  const syncedAt = new Date().toISOString();

  const revenueEntries = revenueRows.map(([month, amount]) => ({
    user_id: user.id,
    platform: "YouTube",
    revenue_type: "Ads",
    amount: Number(amount || 0),
    entry_month: String(month).slice(0, 7),
    notes: "Synced from YouTube Analytics",
    source_platform: "youtube",
    source_entry_id: `youtube-${account.id}-ads-${String(month).slice(0, 7)}`,
    synced_from_api: true,
    synced_at: syncedAt,
  }));

  if (revenueEntries.length > 0) {
    const { error: insertError } = await supabaseAdmin
      .from("revenue_entries")
      .upsert(revenueEntries, {
        onConflict: "user_id,source_platform,source_entry_id",
      });

    if (insertError) {
      console.error("YouTube revenue upsert failed:", insertError);

      await updateSyncStatus(supabaseAdmin, account.id, user.id, {
        sync_status: "error",
        sync_error: "Failed to save YouTube revenue.",
      });

      return NextResponse.json(
        { error: "CreatorsHub could not save the YouTube revenue." },
        { status: 500 }
      );
    }
  }

  const refreshedToken =
    freshTokenData.refresh_token || account.refresh_token;

  const { error: accountUpdateError } = await supabaseAdmin
    .from("connected_accounts")
    .update({
      access_token: freshAccessToken,
      refresh_token: refreshedToken,
      expires_at: expiresAt,
      account_id: channelStats.channel_id,
      account_name: channelStats.channel_title,
      metadata: {
        ...(account.metadata || {}),
        youtube: channelStats,
      },
      last_synced_at: syncedAt,
      last_sync_attempt_at: syncedAt,
      sync_status: "connected",
      sync_error: null,
      updated_at: syncedAt,
    })
    .eq("id", account.id)
    .eq("user_id", user.id)
    .eq("platform", "youtube");

  if (accountUpdateError) {
    console.error(
      "Failed to finalize YouTube connection sync:",
      accountUpdateError
    );

    return NextResponse.json(
      { error: "YouTube data synced, but the connection status could not be updated." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message:
      warnings.length > 0
        ? "YouTube synced with limited data."
        : "YouTube sync completed.",
    imported_rows: revenueEntries.length,
    channel_stats: channelStats,
    warnings,
    date_range: {
      startDate,
      endDate,
    },
  });
}