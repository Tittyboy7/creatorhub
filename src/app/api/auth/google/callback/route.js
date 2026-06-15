import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!clientId || !clientSecret || !redirectUri || !supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Missing required environment variables." },
      { status: 500 }
    );
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok) {
    return NextResponse.json(
      {
        error: "Failed to exchange authorization code.",
        details: tokenData,
      },
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
      platform: "youtube",
      account_id: "youtube",
      account_name: "YouTube",
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: expiresAt,
      sync_status: "connected",
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,platform,account_id",
    }
  );

  if (error) {
    return NextResponse.json(
      {
        error: "Failed to save connected account.",
        details: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_SITE_URL}/connected-accounts`
  );
}