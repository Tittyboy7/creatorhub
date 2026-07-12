import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const OAUTH_STATE_COOKIE = "creatorshub_twitch_oauth_state";

function clearOAuthStateCookie(response) {
  response.cookies.set(OAUTH_STATE_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}

function createErrorResponse(message, status = 400) {
  return clearOAuthStateCookie(
    NextResponse.json(
      {
        error: message,
      },
      {
        status,
      }
    )
  );
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
      "No Twitch account was found for the authorized Twitch user."
    );
  }

  return twitchUser;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const code = searchParams.get("code");
  const returnedState = searchParams.get("state");
  const providerError = searchParams.get("error");

  const storedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;

  if (providerError) {
    return createErrorResponse(
      "Twitch authorization was canceled or denied.",
      400
    );
  }

  if (!code) {
    return createErrorResponse(
      "No authorization code was received from Twitch.",
      400
    );
  }

  if (
    !returnedState ||
    !storedState ||
    returnedState !== storedState
  ) {
    return createErrorResponse(
      "The Twitch connection request could not be verified. Please try again.",
      403
    );
  }

  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  const redirectUri = process.env.TWITCH_REDIRECT_URI;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (
    !clientId ||
    !clientSecret ||
    !redirectUri ||
    !supabaseUrl ||
    !serviceRoleKey ||
    !siteUrl
  ) {
    return createErrorResponse(
      "The Twitch integration is not configured correctly.",
      500
    );
  }

  /*
   * Determine ownership from the authenticated CreatorsHub session.
   * No user ID is accepted from OAuth state or query parameters.
   */
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return createErrorResponse(
      "Your CreatorsHub session expired. Sign in and connect Twitch again.",
      401
    );
  }

  let tokenData;

  try {
    const tokenResponse = await fetch(
      "https://id.twitch.tv/oauth2/token",
      {
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
        cache: "no-store",
      }
    );

    tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      throw new Error(
        tokenData?.message ||
          "Twitch did not return a valid access token."
      );
    }
  } catch (error) {
    console.error("Twitch token exchange failed:", error);

    return createErrorResponse(
      "Twitch could not complete the account connection. Please try again.",
      502
    );
  }

  let twitchUser;

  try {
    twitchUser = await fetchTwitchUser(
      tokenData.access_token,
      clientId
    );
  } catch (error) {
    console.error("Twitch account lookup failed:", error);

    return createErrorResponse(
      error.message || "The Twitch account could not be retrieved.",
      502
    );
  }

  const supabaseAdmin = createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  /*
   * Look up this exact Twitch account for the authenticated user.
   * A creator may connect multiple Twitch accounts, so platform alone
   * is not enough to identify the connection.
   */
  const { data: existingAccount, error: existingAccountError } =
    await supabaseAdmin
      .from("connected_accounts")
      .select("id, refresh_token, metadata")
      .eq("user_id", user.id)
      .eq("platform", "twitch")
      .eq("account_id", twitchUser.id)
      .maybeSingle();

  if (existingAccountError) {
    console.error(
      "Failed to inspect the existing Twitch account:",
      existingAccountError
    );

    return createErrorResponse(
      "CreatorsHub could not check the existing Twitch connection.",
      500
    );
  }

  const refreshToken =
    tokenData.refresh_token ||
    existingAccount?.refresh_token ||
    null;

  if (!refreshToken) {
    return createErrorResponse(
      "Twitch did not provide the long-term access needed to keep this account synced. Reconnect Twitch and try again.",
      400
    );
  }

  const expiresAt = new Date(
    Date.now() +
      Number(tokenData.expires_in || 3600) * 1000
  ).toISOString();

  const twitchMetadata = {
    user_id: twitchUser.id,
    login: twitchUser.login,
    display_name: twitchUser.display_name,
    profile_image_url: twitchUser.profile_image_url,
    broadcaster_type: twitchUser.broadcaster_type,
    view_count: Number(twitchUser.view_count || 0),
  };

  const accountValues = {
    user_id: user.id,
    platform: "twitch",
    account_id: twitchUser.id,
    account_name:
      twitchUser.display_name ||
      twitchUser.login ||
      "Twitch",
    access_token: tokenData.access_token,
    refresh_token: refreshToken,
    expires_at: expiresAt,
    sync_status: "connected",
    sync_error: null,
    metadata: {
      ...(existingAccount?.metadata || {}),
      twitch: twitchMetadata,
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
      .eq("platform", "twitch");

    saveError = result.error;
  } else {
    const result = await supabaseAdmin
      .from("connected_accounts")
      .insert(accountValues);

    saveError = result.error;
  }

  if (saveError) {
    console.error(
      "Failed to save the Twitch connection:",
      saveError
    );

    return createErrorResponse(
      "CreatorsHub could not save the Twitch connection.",
      500
    );
  }

  const redirectResponse = NextResponse.redirect(
    new URL("/connected-accounts", siteUrl)
  );

  return clearOAuthStateCookie(redirectResponse);
}