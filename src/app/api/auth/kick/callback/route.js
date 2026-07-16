import { NextResponse } from "next/server";
import { authenticateIntegrationUser } from "@/lib/integrations/core/authenticateIntegrationUser";
import { createIntegrationAdminClient } from "@/lib/integrations/core/createIntegrationAdminClient";
import {
  clearOAuthStateCookie,
  getStoredOAuthState,
  isValidOAuthState,
} from "@/lib/integrations/oauth/oauthStateCookies";
import {
  clearPkceVerifierCookie,
  getStoredPkceVerifier,
} from "@/lib/integrations/oauth/oauthPkce";

const KICK_OAUTH_STATE_COOKIE =
  "creatorshub_kick_oauth_state";

const KICK_PKCE_VERIFIER_COOKIE =
  "creatorshub_kick_pkce_verifier";

function clearKickOAuthCookies(response) {
  clearOAuthStateCookie({
    response,
    cookieName: KICK_OAUTH_STATE_COOKIE,
  });

  clearPkceVerifierCookie({
    response,
    cookieName: KICK_PKCE_VERIFIER_COOKIE,
  });

  return response;
}

function createErrorResponse(message, status = 400) {
  const response = NextResponse.json(
    {
      error: message,
    },
    {
      status,
    }
  );

  return clearKickOAuthCookies(response);
}

async function exchangeKickCodeForToken({
  code,
  codeVerifier,
  clientId,
  clientSecret,
  redirectUri,
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
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code,
        code_verifier: codeVerifier,
      }),
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok || !data.access_token) {
    throw new Error(
      data?.message ||
        "Kick did not return a valid access token."
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

  const rawUser = Array.isArray(data.data)
    ? data.data[0]
    : data.data;

  if (!rawUser) {
    throw new Error(
      "No Kick account was found for the authorized user."
    );
  }

  return rawUser;
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

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const code = searchParams.get("code");
  const returnedState = searchParams.get("state");
  const providerError = searchParams.get("error");

  const storedState = getStoredOAuthState(
    request,
    KICK_OAUTH_STATE_COOKIE
  );

  const codeVerifier = getStoredPkceVerifier(
    request,
    KICK_PKCE_VERIFIER_COOKIE
  );

  if (providerError) {
    return createErrorResponse(
      "Kick authorization was canceled or denied.",
      400
    );
  }

  if (!code) {
    return createErrorResponse(
      "No authorization code was received from Kick.",
      400
    );
  }

  if (
    !isValidOAuthState({
      returnedState,
      storedState,
    })
  ) {
    return createErrorResponse(
      "The Kick connection request could not be verified. Please try again.",
      403
    );
  }

  if (!codeVerifier) {
    return createErrorResponse(
      "The Kick authorization verifier expired. Please connect Kick again.",
      403
    );
  }

  const clientId = process.env.KICK_CLIENT_ID;
  const clientSecret = process.env.KICK_CLIENT_SECRET;
  const redirectUri = process.env.KICK_REDIRECT_URI;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (
    !clientId ||
    !clientSecret ||
    !redirectUri ||
    !siteUrl
  ) {
    return createErrorResponse(
      "The Kick integration is not configured correctly.",
      500
    );
  }

  const { user, error: userError } =
    await authenticateIntegrationUser();

  if (userError || !user) {
    return createErrorResponse(
      "Your CreatorsHub session expired. Sign in and connect Kick again.",
      401
    );
  }

  let tokenData;

  try {
    tokenData = await exchangeKickCodeForToken({
      code,
      codeVerifier,
      clientId,
      clientSecret,
      redirectUri,
    });
  } catch (error) {
    console.error("Kick token exchange failed:", error);

    return createErrorResponse(
      "Kick could not complete the account connection. Please try again.",
      502
    );
  }

  let kickUser;

  try {
    kickUser = await fetchKickUser(
      tokenData.access_token
    );
  } catch (error) {
    console.error("Kick account lookup failed:", error);

    return createErrorResponse(
      "The Kick account could not be retrieved.",
      502
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

    return createErrorResponse(
      "Kick did not return enough information to save this account.",
      502
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

    return createErrorResponse(
      "CreatorsHub could not access integration storage.",
      500
    );
  }

  /*
   * Look up this exact Kick account for the authenticated user.
   * A creator may connect multiple Kick accounts.
   */
  const {
    data: existingAccount,
    error: existingAccountError,
  } = await supabaseAdmin
    .from("connected_accounts")
    .select("id, refresh_token, metadata")
    .eq("user_id", user.id)
    .eq("platform", "kick")
    .eq("account_id", kickIdentity.accountId)
    .maybeSingle();

  if (existingAccountError) {
    console.error(
      "Failed to inspect the existing Kick account:",
      existingAccountError
    );

    return createErrorResponse(
      "CreatorsHub could not check the existing Kick connection.",
      500
    );
  }

  const refreshToken =
    tokenData.refresh_token ||
    existingAccount?.refresh_token ||
    null;

  if (!refreshToken) {
    return createErrorResponse(
      "Kick did not provide the long-term access needed to keep this account synced. Reconnect Kick and try again.",
      400
    );
  }

  const expiresAt = new Date(
    Date.now() +
      Number(tokenData.expires_in || 3600) * 1000
  ).toISOString();

  const accountValues = {
    user_id: user.id,
    platform: "kick",
    account_id: kickIdentity.accountId,
    account_name: kickIdentity.accountName,
    access_token: tokenData.access_token,
    refresh_token: refreshToken,
    expires_at: expiresAt,
    sync_status: "connected",
    sync_error: null,
    metadata: {
      ...(existingAccount?.metadata || {}),
      kick: kickUser,
    },
    updated_at: new Date().toISOString(),
  };

  let saveError;

  if (existingAccount) {
    const result = await supabaseAdmin
      .from("connected_accounts")
      .update(accountValues)
      .eq("id", existingAccount.id)
      .eq("user_id", user.id)
      .eq("platform", "kick");

    saveError = result.error;
  } else {
    const result = await supabaseAdmin
      .from("connected_accounts")
      .insert(accountValues);

    saveError = result.error;
  }

  if (saveError) {
    console.error(
      "Failed to save the Kick connection:",
      saveError
    );

    return createErrorResponse(
      "CreatorsHub could not save the Kick connection.",
      500
    );
  }

  const redirectResponse = NextResponse.redirect(
    new URL("/connected-accounts", siteUrl)
  );

  return clearKickOAuthCookies(redirectResponse);
}