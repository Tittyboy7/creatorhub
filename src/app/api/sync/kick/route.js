import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

async function refreshKickAccessToken(refreshToken) {
  const response = await fetch("https://id.kick.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.KICK_CLIENT_ID,
      client_secret: process.env.KICK_CLIENT_SECRET,
      refresh_token: refreshToken,
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
      Accept: "application/json",
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
    .eq("platform", "kick")
    .single();

  if (accountError || !account) {
    return NextResponse.json(
      { error: "No connected Kick account found." },
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
      sync_error: "No Kick refresh token found. Reconnect Kick.",
    });

    return NextResponse.json(
      { error: "No Kick refresh token found. Reconnect Kick." },
      { status: 400 }
    );
  }

  try {
    const freshTokenData = await refreshKickAccessToken(account.refresh_token);

    const freshAccessToken = freshTokenData.access_token;
    const freshRefreshToken =
      freshTokenData.refresh_token || account.refresh_token;

    const expiresAt = new Date(
      Date.now() + Number(freshTokenData.expires_in || 3600) * 1000
    ).toISOString();

    const kickUser = await fetchKickUser(freshAccessToken);

    if (!kickUser) {
      throw new Error("No Kick user returned.");
    }

    const kickUserId =
      kickUser.user_id || kickUser.id || kickUser.email || account.account_id;

    const kickDisplayName =
      kickUser.name ||
      kickUser.username ||
      kickUser.display_name ||
      kickUser.email ||
      account.account_name ||
      "Kick";

    const { error: updateError } = await supabaseAdmin
      .from("connected_accounts")
      .update({
        access_token: freshAccessToken,
        refresh_token: freshRefreshToken,
        expires_at: expiresAt,
        account_id: String(kickUserId),
        account_name: kickDisplayName,
        metadata: {
          ...(account.metadata || {}),
          kick: kickUser,
        },
        last_synced_at: new Date().toISOString(),
        last_sync_attempt_at: new Date().toISOString(),
        sync_status: "connected",
        sync_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", account.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return NextResponse.json({
      success: true,
      message: "Kick sync completed.",
      imported_rows: 0,
      kick: kickUser,
    });
  } catch (error) {
    await updateSyncStatus(supabaseAdmin, account.id, {
      sync_status: "error",
      sync_error: error.message || "Kick sync failed.",
    });

    return NextResponse.json(
      {
        error: "Kick sync failed.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}