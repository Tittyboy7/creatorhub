import { NextResponse } from "next/server";
import { createIntegrationAdminClient } from "@/lib/integrations/core/createIntegrationAdminClient";
import { authenticateIntegrationUser } from "@/lib/integrations/core/authenticateIntegrationUser";
import { getOwnedConnectedAccount } from "@/lib/integrations/core/getOwnedConnectedAccount";
import { updateIntegrationSyncStatus } from "@/lib/integrations/core/updateIntegrationSyncStatus";
import { getConnectedAccountIdFromRequest } from "@/lib/integrations/core/getConnectedAccountIdFromRequest";

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
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok || !data.access_token) {
    throw new Error("Twitch could not refresh the access token.");
  }

  return data;
}

async function validateTwitchAccessToken(accessToken) {
  const response = await fetch(
    "https://id.twitch.tv/oauth2/validate",
    {
      headers: {
        Authorization: `OAuth ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error("Twitch could not validate the access token.");
  }

  return data;
}

async function fetchTwitchUser(accessToken, clientId) {
  const response = await fetch("https://api.twitch.tv/helix/users", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Client-Id": clientId,
    },
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || "Failed to retrieve the Twitch account."
    );
  }

  const twitchUser = data.data?.[0];

  if (!twitchUser) {
    throw new Error(
      "No Twitch account was returned for the connected user."
    );
  }

  return twitchUser;
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

  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "The Twitch integration is not configured correctly." },
      { status: 500 }
    );
  }

  /*
   * Verify the currently signed-in CreatorsHub user.
   * Ownership is never accepted from the request body or URL.
   */
  const { user, error: userError } =
    await authenticateIntegrationUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "You must be signed in to sync Twitch." },
      { status: 401 }
    );
  }

  let supabaseAdmin;

  try {
    supabaseAdmin = createIntegrationAdminClient();
  } catch (error) {
    console.error("Failed to create integration admin client:", error);

    return NextResponse.json(
      { error: "CreatorsHub could not access integration storage." },
      { status: 500 }
    );
  }

  /*
   * Retrieve only the exact Twitch account belonging to the
   * authenticated CreatorsHub user.
   */
  let account;

  try {
    account = await getOwnedConnectedAccount({
      supabaseAdmin,
      connectedAccountId,
      userId: user.id,
      platform: "twitch",
    });
  } catch (error) {
    console.error("Failed to retrieve the Twitch connection:", error);

    return NextResponse.json(
      { error: "CreatorsHub could not retrieve the Twitch connection." },
      { status: 500 }
    );
  }

  if (!account) {
    return NextResponse.json(
      { error: "No connected Twitch account was found." },
      { status: 404 }
    );
  }

  await updateIntegrationSyncStatus({
    supabaseAdmin,
    connectedAccountId: account.id,
    userId: user.id,
    platform: "twitch",
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
      platform: "twitch",
      updates: {
        sync_status: "error",
        sync_error:
          "No Twitch refresh token was found. Reconnect Twitch.",
      },
    });

    return NextResponse.json(
      { error: "Reconnect Twitch before syncing again." },
      { status: 400 }
    );
  }

  let freshTokenData;

  try {
    freshTokenData = await refreshTwitchAccessToken(
      account.refresh_token
    );
  } catch (error) {
    console.error("Twitch token refresh failed:", error);

    await updateIntegrationSyncStatus({
      supabaseAdmin,
      connectedAccountId: account.id,
      userId: user.id,
      platform: "twitch",
      updates: {
        sync_status: "error",
        sync_error: "Failed to refresh the Twitch access token.",
      },
    });

    return NextResponse.json(
      {
        error:
          "Twitch authentication expired. Reconnect and try again.",
      },
      { status: 502 }
    );
  }

  const freshAccessToken = freshTokenData.access_token;

    let tokenValidation;

      try {
        tokenValidation = await validateTwitchAccessToken(
          freshAccessToken
        );
      } catch (error) {
        console.error("Twitch token validation failed:", error);

        await updateIntegrationSyncStatus({
          supabaseAdmin,
          connectedAccountId: account.id,
          userId: user.id,
          platform: "twitch",
          updates: {
            sync_status: "error",
            sync_error: "Twitch could not validate the refreshed token.",
          },
        });

        return NextResponse.json(
          {
            error: "Twitch could not validate the refreshed connection.",
          },
          { status: 502 }
        );
      }

      /*
       * Confirm that Twitch issued the token for this application
       * and for the exact Twitch account being synced.
       */
      if (
        tokenValidation.client_id !== clientId ||
        tokenValidation.user_id !== account.account_id
      ) {
        await updateIntegrationSyncStatus({
          supabaseAdmin,
          connectedAccountId: account.id,
          userId: user.id,
          platform: "twitch",
          updates: {
            sync_status: "error",
            sync_error:
              "The Twitch token did not match the connected account.",
          },
        });

        return NextResponse.json(
          {
            error:
              "The Twitch connection could not be verified. Reconnect this account.",
          },
          { status: 403 }
        );
      }

  let twitchUser;

  try {
    twitchUser = await fetchTwitchUser(
      freshAccessToken,
      clientId
    );
  } catch (error) {
    console.error("Twitch account sync failed:", error);

    await updateIntegrationSyncStatus({
      supabaseAdmin,
      connectedAccountId: account.id,
      userId: user.id,
      platform: "twitch",
      updates: {
        sync_status: "error",
        sync_error: "Failed to retrieve Twitch account data.",
      },
    });

    return NextResponse.json(
      {
        error: "Twitch account data could not be retrieved.",
      },
      { status: 502 }
    );
  }

  if (twitchUser.id !== account.account_id) {
    await updateIntegrationSyncStatus({
      supabaseAdmin,
      connectedAccountId: account.id,
      userId: user.id,
      platform: "twitch",
      updates: {
        sync_status: "error",
        sync_error:
          "The returned Twitch account did not match the connection.",
      },
    });

    return NextResponse.json(
      {
        error:
          "The returned Twitch account did not match this connection.",
      },
      { status: 403 }
    );
  }

  const syncedAt = new Date().toISOString();

  const expiresAt = new Date(
    Date.now() +
      Number(
        freshTokenData.expires_in ||
          tokenValidation.expires_in ||
          3600
      ) *
        1000
  ).toISOString();

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
      refresh_token:
        freshTokenData.refresh_token || account.refresh_token,
      expires_at: expiresAt,
      account_id: twitchUser.id,
      account_name:
        twitchUser.display_name ||
        twitchUser.login ||
        "Twitch",
      metadata: {
        ...(account.metadata || {}),
        twitch: twitchMetadata,
      },
      last_synced_at: syncedAt,
      last_sync_attempt_at: syncedAt,
      sync_status: "connected",
      sync_error: null,
      updated_at: syncedAt,
    })
    .eq("id", account.id)
    .eq("user_id", user.id)
    .eq("platform", "twitch");

  if (updateError) {
    console.error(
      "Failed to finalize the Twitch sync:",
      updateError
    );

    return NextResponse.json(
      {
        error:
          "Twitch data synced, but the connection status could not be updated.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Twitch synced successfully.",
    imported_rows: 0,
    twitch: twitchMetadata,
  });
}