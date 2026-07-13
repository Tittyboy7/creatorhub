import { NextResponse } from "next/server";
import { authenticateIntegrationUser } from "@/lib/integrations/core/authenticateIntegrationUser";
import {
  createOAuthState,
  setOAuthStateCookie,
} from "@/lib/integrations/oauth/oauthStateCookies";

const TWITCH_OAUTH_STATE_COOKIE =
  "creatorshub_twitch_oauth_state";

export async function GET() {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const redirectUri = process.env.TWITCH_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "The Twitch integration is not configured correctly." },
      { status: 500 }
    );
  }

  const { user, error: userError } =
    await authenticateIntegrationUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "You must be signed in to connect Twitch." },
      { status: 401 }
    );
  }

  const state = createOAuthState();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    force_verify: "true",
    state,
    scope: [
      "user:read:email",
      "channel:read:subscriptions",
    ].join(" "),
  });

  const response = NextResponse.redirect(
    `https://id.twitch.tv/oauth2/authorize?${params.toString()}`
  );

  return setOAuthStateCookie({
    response,
    cookieName: TWITCH_OAUTH_STATE_COOKIE,
    state,
  });
}