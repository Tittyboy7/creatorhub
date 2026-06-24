import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

async function exchangeStreamElementsCodeForToken(code) {
  const response = await fetch("https://api.streamelements.com/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.STREAMELEMENTS_CLIENT_ID,
      client_secret: process.env.STREAMELEMENTS_CLIENT_SECRET,
      redirect_uri: process.env.STREAMELEMENTS_REDIRECT_URI,
      code,
    }),
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
      { error: "No StreamElements authorization code received." },
      { status: 400 }
    );
  }

  if (!userId) {
    return NextResponse.json(
      { error: "No user ID received." },
      { status: 400 }
    );
  }

  try {
    const tokenData = await exchangeStreamElementsCodeForToken(code);

    const expiresAt = tokenData.expires_in
      ? new Date(Date.now() + Number(tokenData.expires_in) * 1000).toISOString()
      : null;

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { error } = await supabaseAdmin.from("connected_accounts").upsert(
      {
        user_id: userId,
        platform: "streamelements",
        account_id: tokenData.account_id || tokenData.user_id || "streamelements",
        account_name: "StreamElements",
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || null,
        expires_at: expiresAt,
        sync_status: "connected",
        sync_error: null,
        metadata: {
          streamelements: {
            token_type: tokenData.token_type || null,
            scope: tokenData.scope || null,
          },
        },
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,platform,account_id",
      }
    );

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/connected-accounts`
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to connect StreamElements.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}