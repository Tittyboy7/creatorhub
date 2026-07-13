import { NextResponse } from "next/server";
import { createIntegrationAdminClient } from "@/lib/integrations/core/createIntegrationAdminClient";
import { authenticateIntegrationUser } from "@/lib/integrations/core/authenticateIntegrationUser";
import {
  clearOAuthStateCookie,
  getStoredOAuthState,
  isValidOAuthState,
} from "@/lib/integrations/oauth/oauthStateCookies";

const GOOGLE_OAUTH_STATE_COOKIE =
  "creatorshub_google_oauth_state";

function createErrorResponse(message, status = 400) {
  const response = NextResponse.json(
    {
      error: message,
    },
    {
      status,
    }
  );

  return clearOAuthStateCookie({
    response,
    cookieName: GOOGLE_OAUTH_STATE_COOKIE,
  });
}

async function fetchYouTubeChannel(accessToken) {
  const response = await fetch(
    "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message || "Failed to retrieve the YouTube channel."
    );
  }

  const channel = data.items?.[0];

  if (!channel) {
    throw new Error(
      "No YouTube channel was found for the connected Google account."
    );
  }

  return {
    channel_id: channel.id,
    channel_title: channel.snippet?.title || "YouTube",
    subscriber_count: Number(channel.statistics?.subscriberCount || 0),
    view_count: Number(channel.statistics?.viewCount || 0),
    video_count: Number(channel.statistics?.videoCount || 0),
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const code = searchParams.get("code");
  const returnedState = searchParams.get("state");
  const providerError = searchParams.get("error");

  const storedState = getStoredOAuthState(
    request,
    GOOGLE_OAUTH_STATE_COOKIE
  );

  if (providerError) {
    return createErrorResponse(
      "YouTube authorization was canceled or denied.",
      400
    );
  }

  if (!code) {
    return createErrorResponse(
      "No authorization code was received from Google.",
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
      "The YouTube connection request could not be verified. Please try again.",
      403
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (
    !clientId ||
    !clientSecret ||
    !redirectUri ||
    !siteUrl
  ) {
    return createErrorResponse(
      "The YouTube integration is not configured correctly.",
      500
    );
  }

  /*
   * Determine ownership from the verified Supabase session.
   * No user ID is accepted from Google state or query parameters.
   */
  const { user, error: userError } =
    await authenticateIntegrationUser();

  if (userError || !user) {
    return createErrorResponse(
      "Your CreatorsHub session expired. Sign in and connect YouTube again.",
      401
    );
  }

  let tokenData;

  try {
    const tokenResponse = await fetch(
      "https://oauth2.googleapis.com/token",
      {
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
        cache: "no-store",
      }
    );

    tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      throw new Error("Google did not return a valid access token.");
    }
  } catch (error) {
    console.error("Google token exchange failed:", error);

    return createErrorResponse(
      "Google could not complete the YouTube connection. Please try again.",
      502
    );
  }

  let channelStats;

  try {
    channelStats = await fetchYouTubeChannel(tokenData.access_token);
  } catch (error) {
    console.error("YouTube channel lookup failed:", error);

    return createErrorResponse(
      error.message || "The YouTube channel could not be retrieved.",
      502
    );
  }

  let supabaseAdmin;

  try {
    supabaseAdmin = createIntegrationAdminClient();
  } catch (error) {
    console.error("Failed to create integration admin client:", error);

    return createErrorResponse(
      "CreatorsHub could not access integration storage.",
      500
    );
  }

  /*
   * Look up this exact YouTube channel for the authenticated user.
   * A creator may connect multiple YouTube channels, so platform alone
   * is not enough to identify the connected account.
   */
  const { data: existingAccount, error: existingAccountError } =
    await supabaseAdmin
      .from("connected_accounts")
      .select("id, refresh_token, metadata")
      .eq("user_id", user.id)
      .eq("platform", "youtube")
      .eq("account_id", channelStats.channel_id)
      .maybeSingle();

  if (existingAccountError) {
    console.error(
      "Failed to inspect existing YouTube account:",
      existingAccountError
    );

    return createErrorResponse(
      "CreatorsHub could not check the existing YouTube connection.",
      500
    );
  }

  const refreshToken =
    tokenData.refresh_token || existingAccount?.refresh_token || null;

  if (!refreshToken) {
    return createErrorResponse(
      "Google did not provide the long-term access needed to sync YouTube. Remove CreatorsHub from your Google permissions and reconnect.",
      400
    );
  }

  const expiresAt = new Date(
    Date.now() + Number(tokenData.expires_in || 3600) * 1000
  ).toISOString();

  const accountValues = {
    user_id: user.id,
    platform: "youtube",
    account_id: channelStats.channel_id,
    account_name: channelStats.channel_title,
    access_token: tokenData.access_token,
    refresh_token: refreshToken,
    expires_at: expiresAt,
    sync_status: "connected",
    sync_error: null,
    metadata: {
      ...(existingAccount?.metadata || {}),
      youtube: channelStats,
    },
    updated_at: new Date().toISOString(),
  };

  let saveError;

  if (existingAccount) {
    const result = await supabaseAdmin
      .from("connected_accounts")
      .update(accountValues)
      .eq("id", existingAccount.id)
      .eq("user_id", user.id);

    saveError = result.error;
  } else {
    const result = await supabaseAdmin
      .from("connected_accounts")
      .insert(accountValues);

    saveError = result.error;
  }

  if (saveError) {
    console.error("Failed to save YouTube connection:", saveError);

    return createErrorResponse(
      "CreatorsHub could not save the YouTube connection.",
      500
    );
  }

  const redirectResponse = NextResponse.redirect(
    new URL("/connected-accounts", siteUrl)
  );

  return clearOAuthStateCookie({
    response: redirectResponse,
    cookieName: GOOGLE_OAUTH_STATE_COOKIE,
  });
}