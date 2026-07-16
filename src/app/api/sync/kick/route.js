import { NextResponse } from "next/server";
import { authenticateIntegrationUser } from "@/lib/integrations/core/authenticateIntegrationUser";
import { createIntegrationAdminClient } from "@/lib/integrations/core/createIntegrationAdminClient";
import { getConnectedAccountIdFromRequest } from "@/lib/integrations/core/getConnectedAccountIdFromRequest";
import { getOwnedConnectedAccount } from "@/lib/integrations/core/getOwnedConnectedAccount";
import { updateIntegrationSyncStatus } from "@/lib/integrations/core/updateIntegrationSyncStatus";

async function refreshKickAccessToken({
  refreshToken,
  clientId,
  clientSecret,
}) {
  const response = await fetch(
    "https://id.kick.com/oauth/token",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      }),
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok || !data.access_token) {
    throw new Error(
      data?.message ||
        "Kick could not refresh the access token."
    );
  }

  return data;
}

async function fetchKickUser(accessToken) {
  const response = await fetch(
    "https://api.kick.com/public/v1/users",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Failed to retrieve the Kick account."
    );
  }

  const kickUser = Array.isArray(data.data)
    ? data.data[0]
    : data.data;

  if (!kickUser) {
    throw new Error(
      "No Kick account was returned for the connected user."
    );
  }

  return kickUser;
}

function getKickAccountIdentity(kickUser) {
  const accountId =
    kickUser.user_id ||
    kickUser.id ||
    kickUser.email ||
    null;

  const accountName =
    kickUser.name ||
    kickUser.username ||
    kickUser.display_name ||
    kickUser.email ||
    "Kick";

  if (!accountId) {
    throw new Error(
      "Kick did not return a stable account identifier."
    );
  }

  return {
    accountId: String(accountId),
    accountName,
  };
}

export async function POST(request) {
  const {
    connectedAccountId,
    error: requestError,
  } = await getConnectedAccountIdFromRequest(request);

  if (requestError || !connectedAccountId) {
    return NextResponse.json(
      { error: "Missing connected account ID." },
      { status: 400 }
    );
  }

  const clientId = process.env.KICK_CLIENT_ID;
  const clientSecret = process.env.KICK_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      {
        error:
          "The Kick integration is not configured correctly.",
      },
      { status: 500 }
    );
  }

  const { user, error: userError } =
    await authenticateIntegrationUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "You must be signed in to sync Kick." },
      { status: 401 }
    );
  }

  let supabaseAdmin;

  try {
    supabaseAdmin = createIntegrationAdminClient();
  } catch (error) {
    console.error(
      "Failed to create integration admin client:",
      error
    );

    return NextResponse.json(
      {
        error:
          "CreatorsHub could not access integration storage.",
      },
      { status: 500 }
    );
  }

  let account;

  try {
    account = await getOwnedConnectedAccount({
      supabaseAdmin,
      connectedAccountId,
      userId: user.id,
      platform: "kick",
    });
  } catch (error) {
    console.error(
      "Failed to retrieve the Kick connection:",
      error
    );

    return NextResponse.json(
      {
        error:
          "CreatorsHub could not retrieve the Kick connection.",
      },
      { status: 500 }
    );
  }

  if (!account) {
    return NextResponse.json(
      { error: "No connected Kick account was found." },
      { status: 404 }
    );
  }

  await updateIntegrationSyncStatus({
    supabaseAdmin,
    connectedAccountId: account.id,
    userId: user.id,
    platform: "kick",
    updates: {
      sync_status: "syncing",
      sync_error: null,
    },
  });

  if (!account.refresh_token) {
    await updateIntegrationSyncStatus({
      supabaseAdmin,
      connectedAccountId: account.id,
      userId: user.id,
      platform: "kick",
      updates: {
        sync_status: "error",
        sync_error:
          "No Kick refresh token was found. Reconnect Kick.",
      },
    });

    return NextResponse.json(
      { error: "Reconnect Kick before syncing again." },
      { status: 400 }
    );
  }

  let freshTokenData;

  try {
    freshTokenData = await refreshKickAccessToken({
      refreshToken: account.refresh_token,
      clientId,
      clientSecret,
    });
  } catch (error) {
    console.error("Kick token refresh failed:", error);

    await updateIntegrationSyncStatus({
      supabaseAdmin,
      connectedAccountId: account.id,
      userId: user.id,
      platform: "kick",
      updates: {
        sync_status: "error",
        sync_error:
          "Failed to refresh the Kick access token.",
      },
    });

    return NextResponse.json(
      {
        error:
          "Kick authentication expired. Reconnect and try again.",
      },
      { status: 502 }
    );
  }

  const freshAccessToken = freshTokenData.access_token;

  let kickUser;

  try {
    kickUser = await fetchKickUser(freshAccessToken);
  } catch (error) {
    console.error("Kick account sync failed:", error);

    await updateIntegrationSyncStatus({
      supabaseAdmin,
      connectedAccountId: account.id,
      userId: user.id,
      platform: "kick",
      updates: {
        sync_status: "error",
        sync_error:
          "Failed to retrieve Kick account data.",
      },
    });

    return NextResponse.json(
      {
        error:
          "Kick account data could not be retrieved.",
      },
      { status: 502 }
    );
  }

  let kickIdentity;

  try {
    kickIdentity = getKickAccountIdentity(kickUser);
  } catch (error) {
    console.error(
      "Kick account identity resolution failed:",
      error
    );

    await updateIntegrationSyncStatus({
      supabaseAdmin,
      connectedAccountId: account.id,
      userId: user.id,
      platform: "kick",
      updates: {
        sync_status: "error",
        sync_error:
          "Kick did not return a stable account identifier.",
      },
    });

    return NextResponse.json(
      {
        error:
          "The connected Kick account could not be verified.",
      },
      { status: 502 }
    );
  }

  if (kickIdentity.accountId !== account.account_id) {
    await updateIntegrationSyncStatus({
      supabaseAdmin,
      connectedAccountId: account.id,
      userId: user.id,
      platform: "kick",
      updates: {
        sync_status: "error",
        sync_error:
          "The returned Kick account did not match the connection.",
      },
    });

    return NextResponse.json(
      {
        error:
          "The returned Kick account did not match this connection.",
      },
      { status: 403 }
    );
  }

  const syncedAt = new Date().toISOString();

  const expiresAt = new Date(
    Date.now() +
      Number(freshTokenData.expires_in || 3600) *
        1000
  ).toISOString();

  const { error: updateError } = await supabaseAdmin
    .from("connected_accounts")
    .update({
      access_token: freshAccessToken,
      refresh_token:
        freshTokenData.refresh_token ||
        account.refresh_token,
      expires_at: expiresAt,
      account_id: kickIdentity.accountId,
      account_name: kickIdentity.accountName,
      metadata: {
        ...(account.metadata || {}),
        kick: kickUser,
      },
      last_synced_at: syncedAt,
      last_sync_attempt_at: syncedAt,
      sync_status: "connected",
      sync_error: null,
      updated_at: syncedAt,
    })
    .eq("id", account.id)
    .eq("user_id", user.id)
    .eq("platform", "kick");

  if (updateError) {
    console.error(
      "Failed to finalize the Kick sync:",
      updateError
    );

    return NextResponse.json(
      {
        error:
          "Kick data synced, but the connection status could not be updated.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Kick synced successfully.",
    imported_rows: 0,
    kick: kickUser,
  });
}