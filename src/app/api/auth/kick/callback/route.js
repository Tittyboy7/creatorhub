import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function decodeState(state) {
  const decoded = Buffer.from(state, "base64url").toString("utf8");
  return JSON.parse(decoded);
}

async function exchangeKickCodeForToken({ code, codeVerifier }) {
  const response = await fetch("https://id.kick.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.KICK_CLIENT_ID,
      client_secret: process.env.KICK_CLIENT_SECRET,
      redirect_uri: process.env.KICK_REDIRECT_URI,
      code,
      code_verifier: codeVerifier,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
}

async function fetchKickUser(accessToken) {
  const response = await fetch("https://api.kick.com/public/v1/users", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data.data?.[0] || data.data || null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code) {
    return NextResponse.json(
      { error: "No Kick authorization code received." },
      { status: 400 }
    );
  }

  if (!state) {
    return NextResponse.json(
      { error: "No Kick state received." },
      { status: 400 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (
    !process.env.KICK_CLIENT_ID ||
    !process.env.KICK_CLIENT_SECRET ||
    !process.env.KICK_REDIRECT_URI ||
    !supabaseUrl ||
    !serviceRoleKey
  ) {
    return NextResponse.json(
      { error: "Missing required Kick environment variables." },
      { status: 500 }
    );
  }

  let decodedState;

  try {
    decodedState = decodeState(state);
  } catch {
    return NextResponse.json(
      { error: "Invalid Kick state." },
      { status: 400 }
    );
  }

  const userId = decodedState.user_id;
  const codeVerifier = decodedState.code_verifier;

  if (!userId || !codeVerifier) {
    return NextResponse.json(
      { error: "Missing Kick user ID or code verifier." },
      { status: 400 }
    );
  }

  let tokenData;

  try {
    tokenData = await exchangeKickCodeForToken({
      code,
      codeVerifier,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to exchange Kick authorization code.",
        details: error.message,
      },
      { status: 500 }
    );
  }

  let kickUser;

  try {
    kickUser = await fetchKickUser(tokenData.access_token);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch Kick user.",
        details: error.message,
      },
      { status: 500 }
    );
  }

  if (!kickUser) {
    return NextResponse.json(
      { error: "No Kick user returned." },
      { status: 500 }
    );
  }

  const expiresAt = new Date(
    Date.now() + Number(tokenData.expires_in || 3600) * 1000
  ).toISOString();

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  const kickUserId = kickUser.user_id || kickUser.id || kickUser.email || "kick";

  const kickDisplayName =
    kickUser.name ||
    kickUser.username ||
    kickUser.display_name ||
    kickUser.email ||
    "Kick";

  const { error } = await supabaseAdmin.from("connected_accounts").upsert(
    {
      user_id: userId,
      platform: "kick",
      account_id: String(kickUserId),
      account_name: kickDisplayName,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || null,
      expires_at: expiresAt,
      sync_status: "connected",
      sync_error: null,
      metadata: {
        kick: kickUser,
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
        error: "Failed to save Kick connected account.",
        details: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_SITE_URL}/connected-accounts`
  );
}