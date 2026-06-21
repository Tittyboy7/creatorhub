import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const code = searchParams.get("code");
  const userId = searchParams.get("state");

  if (!code) {
    return NextResponse.json(
      { error: "No authorization code received." },
      { status: 400 }
    );
  }

  if (!userId) {
    return NextResponse.json(
      { error: "No user ID received." },
      { status: 400 }
    );
  }

  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  const redirectUri = process.env.TWITCH_REDIRECT_URI;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (
    !clientId ||
    !clientSecret ||
    !redirectUri ||
    !supabaseUrl ||
    !serviceRoleKey
  ) {
    return NextResponse.json(
      { error: "Missing required environment variables." },
      { status: 500 }
    );
  }

  const tokenResponse = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok) {
    return NextResponse.json(
      {
        error: "Failed to exchange Twitch authorization code.",
        details: tokenData,
      },
      { status: 500 }
    );
  }

  let twitchUser = null;

  try {
    twitchUser = await fetchTwitchUser(tokenData.access_token, clientId);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch Twitch user.",
        details: error.message,
      },
      { status: 500 }
    );
  }

  if (!twitchUser) {
    return NextResponse.json(
      { error: "No Twitch user returned." },
      { status: 500 }
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  const expiresAt = new Date(
    Date.now() + Number(tokenData.expires_in || 3600) * 1000
  ).toISOString();

  const { error } = await supabaseAdmin.from("connected_accounts").upsert(
    {
      user_id: userId,
      platform: "twitch",
      account_id: twitchUser.id,
      account_name: twitchUser.display_name || twitchUser.login || "Twitch",
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: expiresAt,
      sync_status: "connected",
      sync_error: null,
      metadata: {
        twitch: {
          user_id: twitchUser.id,
          login: twitchUser.login,
          display_name: twitchUser.display_name,
          profile_image_url: twitchUser.profile_image_url,
          broadcaster_type: twitchUser.broadcaster_type,
          view_count: Number(twitchUser.view_count || 0),
        },
      },
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,platform,account_id",
    }
  );

  if (error) {
    return NextResponse.json(
      {
        error: "Failed to save Twitch connected account.",
        details: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_SITE_URL}/connected-accounts`
  );
}