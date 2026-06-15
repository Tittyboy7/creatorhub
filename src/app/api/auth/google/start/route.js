import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Missing Google OAuth environment variables." },
      { status: 500 }
    );
  }

  if (!userId) {
    return NextResponse.json(
      { error: "Missing user ID." },
      { status: 400 }
    );
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    state: userId,
    scope: [
      "https://www.googleapis.com/auth/youtube.readonly",
      "https://www.googleapis.com/auth/yt-analytics.readonly",
      "https://www.googleapis.com/auth/yt-analytics-monetary.readonly",
    ].join(" "),
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
}