import { NextResponse } from "next/server";
import { authenticateIntegrationUser } from "@/lib/integrations/core/authenticateIntegrationUser";
import {
  createOAuthState,
  setOAuthStateCookie,
} from "@/lib/integrations/oauth/oauthStateCookies";
import {
  createPkcePair,
  setPkceVerifierCookie,
} from "@/lib/integrations/oauth/oauthPkce";

const KICK_OAUTH_STATE_COOKIE =
  "creatorshub_kick_oauth_state";

const KICK_PKCE_VERIFIER_COOKIE =
  "creatorshub_kick_pkce_verifier";

export async function GET() {
  const clientId = process.env.KICK_CLIENT_ID;
  const redirectUri = process.env.KICK_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "The Kick integration is not configured correctly." },
      { status: 500 }
    );
  }

  const { user, error: userError } =
    await authenticateIntegrationUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "You must be signed in to connect Kick." },
      { status: 401 }
    );
  }

  const state = createOAuthState();

  const {
    codeVerifier,
    codeChallenge,
  } = createPkcePair();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "user:read",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  const response = NextResponse.redirect(
    `https://id.kick.com/oauth/authorize?${params.toString()}`
  );

  setOAuthStateCookie({
    response,
    cookieName: KICK_OAUTH_STATE_COOKIE,
    state,
  });

  return setPkceVerifierCookie({
    response,
    cookieName: KICK_PKCE_VERIFIER_COOKIE,
    codeVerifier,
  });
}