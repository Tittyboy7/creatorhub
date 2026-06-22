import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

async function fetchPatreonIdentity(accessToken) {
  const response = await fetch(
    "https://www.patreon.com/api/oauth2/v2/identity?fields%5Buser%5D=full_name,email,image_url",
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

  return data.data || null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const code = searchParams.get("code");
  const userId = searchParams.get("state");

  if (!code) {
    return NextResponse.json(
      { error: "No Patreon authorization code received." },
      { status: 400 }
    );
  }

  if (!userId) {
    return NextResponse.json(
      { error: "No user ID received." },
      { status: 400 }
    );
  }

  const clientId = process.env.PATREON_CLIENT_ID;
  const clientSecret = process.env.PATREON_CLIENT_SECRET;
  const redirectUri = process.env.PATREON_REDIRECT_URI;
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
      { error: "Missing required Patreon environment variables." },
      { status: 500 }
    );
  }

  const tokenResponse = await fetch(
    "https://www.patreon.com/api/oauth2/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    }
  );

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok) {
    return NextResponse.json(
      {
        error: "Failed to exchange Patreon authorization code.",
        details: tokenData,
      },
      { status: 500 }
    );
  }

  let patreonIdentity = null;

  try {
    patreonIdentity = await fetchPatreonIdentity(tokenData.access_token);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch Patreon identity.",
        details: error.message,
      },
      { status: 500 }
    );
  }

  if (!patreonIdentity) {
    return NextResponse.json(
      { error: "No Patreon identity returned." },
      { status: 500 }
    );
  }

  const expiresAt = new Date(
    Date.now() + Number(tokenData.expires_in || 3600) * 1000
  ).toISOString();

  const patreonUserId = patreonIdentity.id;
  const patreonName =
    patreonIdentity.attributes?.full_name ||
    patreonIdentity.attributes?.email ||
    "Patreon";

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  const { error } = await supabaseAdmin.from("connected_accounts").upsert(
    {
      user_id: userId,
      platform: "patreon",
      account_id: patreonUserId,
      account_name: patreonName,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || null,
      expires_at: expiresAt,
      sync_status: "connected",
      sync_error: null,
      metadata: {
        patreon: {
          user_id: patreonUserId,
          full_name: patreonIdentity.attributes?.full_name || null,
          email: patreonIdentity.attributes?.email || null,
          image_url: patreonIdentity.attributes?.image_url || null,
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
        error: "Failed to save Patreon connected account.",
        details: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_SITE_URL}/connected-accounts`
  );
}