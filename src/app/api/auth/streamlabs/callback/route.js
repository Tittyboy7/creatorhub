import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

async function fetchStreamlabsUser(accessToken) {
  const response = await fetch("https://streamlabs.com/api/v2.0/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const code = searchParams.get("code");
  const userId = searchParams.get("state");

  if (!code) {
    return NextResponse.json(
      { error: "No Streamlabs authorization code received." },
      { status: 400 }
    );
  }

  if (!userId) {
    return NextResponse.json(
      { error: "No user ID received." },
      { status: 400 }
    );
  }

  const clientId = process.env.STREAMLABS_CLIENT_ID;
  const clientSecret = process.env.STREAMLABS_CLIENT_SECRET;
  const redirectUri = process.env.STREAMLABS_REDIRECT_URI;
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
      { error: "Missing required Streamlabs environment variables." },
      { status: 500 }
    );
  }

  const tokenResponse = await fetch("https://streamlabs.com/api/v2.0/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
    }),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok) {
    return NextResponse.json(
      {
        error: "Failed to exchange Streamlabs authorization code.",
        details: tokenData,
      },
      { status: 500 }
    );
  }

  let streamlabsUser = null;

  try {
    streamlabsUser = await fetchStreamlabsUser(tokenData.access_token);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch Streamlabs user.",
        details: error.message,
      },
      { status: 500 }
    );
  }

  const streamlabsUserId =
    streamlabsUser?.id ||
    streamlabsUser?.streamlabs?.id ||
    streamlabsUser?.twitch?.id ||
    streamlabsUser?.youtube?.id ||
    "streamlabs";

  const streamlabsName =
    streamlabsUser?.display_name ||
    streamlabsUser?.name ||
    streamlabsUser?.username ||
    streamlabsUser?.streamlabs?.display_name ||
    streamlabsUser?.twitch?.display_name ||
    streamlabsUser?.youtube?.title ||
    "Streamlabs";

  const expiresAt = new Date(
    Date.now() + Number(tokenData.expires_in || 3600) * 1000
  ).toISOString();

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  const { error } = await supabaseAdmin.from("connected_accounts").upsert(
    {
      user_id: userId,
      platform: "streamlabs",
      account_id: String(streamlabsUserId),
      account_name: streamlabsName,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || null,
      expires_at: expiresAt,
      sync_status: "connected",
      sync_error: null,
      metadata: {
        streamlabs: {
          user: streamlabsUser,
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
        error: "Failed to save Streamlabs connected account.",
        details: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_SITE_URL}/connected-accounts`
  );
}