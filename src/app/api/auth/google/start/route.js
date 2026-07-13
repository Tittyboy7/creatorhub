import { NextResponse } from "next/server";
import { authenticateIntegrationUser } from "@/lib/integrations/core/authenticateIntegrationUser";
import {
  createOAuthState,
  setOAuthStateCookie,
} from "@/lib/integrations/oauth/oauthStateCookies";

const GOOGLE_OAUTH_STATE_COOKIE =
  "creatorshub_google_oauth_state";

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Missing Google OAuth environment variables." },
      { status: 500 }
    );
  }

  const { user, error: userError } =
    await authenticateIntegrationUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "You must be signed in to connect YouTube." },
      { status: 401 }
    );
  }

  const state = createOAuthState();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    state,
    scope: [
      "https://www.googleapis.com/auth/youtube.readonly",
      "https://www.googleapis.com/auth/yt-analytics.readonly",
      "https://www.googleapis.com/auth/yt-analytics-monetary.readonly",
    ].join(" "),
  });

  const response = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );

  return setOAuthStateCookie({
    response,
    cookieName: GOOGLE_OAUTH_STATE_COOKIE,
    state,
  });
}