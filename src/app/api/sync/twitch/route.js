import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

async function refreshTwitchAccessToken(refreshToken) {
  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.TWITCH_CLIENT_ID,
      client_secret: process.env.TWITCH_CLIENT_SECRET,
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

async function fetchTwitchUser(accessToken, clientId) {
  const response = await fetch("https://api.twitch.tv/helix/users", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Client-Id": clientId,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data.data?.[0] || null;
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

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");

  if (!userId) {
    return NextResponse.json({ error: "Missing user_id." }, { status: 400 });
  }

  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!clientId || !clientSecret || !supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Missing required Twitch sync environment variables." },
      { status: 500 }
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  const { data: account, error: accountError } = await supabaseAdmin
    .from("connected_accounts")
    .select("*")
    .eq("user_id", userId)
    .eq("platform", "twitch")
    .single();

  if (accountError || !account) {
    return NextResponse.json(
      { error: "No connected Twitch account found." },
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
      sync_error: "No Twitch refresh token found. Reconnect Twitch.",
    });

    return NextResponse.json(
      { error: "No Twitch refresh token found. Reconnect Twitch." },
      { status: 400 }
    );
  }

  let freshTokenData;

  try {
    freshTokenData = await refreshTwitchAccessToken(account.refresh_token);
  } catch (error) {
    await updateSyncStatus(supabaseAdmin, account.id, {
      sync_status: "error",
      sync_error: "Failed to refresh Twitch access token.",
    });

    return NextResponse.json(
      {
        error: "Failed to refresh Twitch access token.",
        details: error.message,
      },
      { status: 500 }
    );
  }

  const freshAccessToken = freshTokenData.access_token;

  const expiresAt = new Date(
    Date.now() + Number(freshTokenData.expires_in || 3600) * 1000
  ).toISOString();

  let twitchUser = null;

  try {
    twitchUser = await fetchTwitchUser(freshAccessToken, clientId);
  } catch (error) {
    await updateSyncStatus(supabaseAdmin, account.id, {
      sync_status: "error",
      sync_error: "Failed to fetch Twitch user data.",
    });

    return NextResponse.json(
      {
        error: "Failed to fetch Twitch user data.",
        details: error.message,
      },
      { status: 500 }
    );
  }

  if (!twitchUser) {
    await updateSyncStatus(supabaseAdmin, account.id, {
      sync_status: "error",
      sync_error: "No Twitch user returned.",
    });

    return NextResponse.json(
      { error: "No Twitch user returned." },
      { status: 500 }
    );
  }

  const twitchMetadata = {
    user_id: twitchUser.id,
    login: twitchUser.login,
    display_name: twitchUser.display_name,
    profile_image_url: twitchUser.profile_image_url,
    broadcaster_type: twitchUser.broadcaster_type,
    view_count: Number(twitchUser.view_count || 0),
  };

  const { error: updateError } = await supabaseAdmin
    .from("connected_accounts")
    .update({
      access_token: freshAccessToken,
      refresh_token: freshTokenData.refresh_token || account.refresh_token,
      expires_at: expiresAt,
      account_id: twitchUser.id,
      account_name: twitchUser.display_name || twitchUser.login || "Twitch",
      metadata: {
        ...(account.metadata || {}),
        twitch: twitchMetadata,
      },
      last_synced_at: new Date().toISOString(),
      last_sync_attempt_at: new Date().toISOString(),
      sync_status: "connected",
      sync_error: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", account.id);

  if (updateError) {
    return NextResponse.json(
      {
        error: "Failed to update Twitch connected account.",
        details: updateError.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Twitch sync completed.",
    imported_rows: 0,
    twitch: twitchMetadata,
  });
}