import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const OAUTH_STATE_COOKIE = "creatorshub_twitch_oauth_state";

export async function GET() {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const redirectUri = process.env.TWITCH_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "The Twitch integration is not configured correctly." },
      { status: 500 }
    );
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "You must be signed in to connect Twitch." },
      { status: 401 }
    );
  }

  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    state,
    scope: [
      "user:read:email",
      "channel:read:subscriptions",
    ].join(" "),
  });

  const response = NextResponse.redirect(
    `https://id.twitch.tv/oauth2/authorize?${params.toString()}`
  );

  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });

  return response;
}