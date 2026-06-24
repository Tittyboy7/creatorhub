import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");

  const clientId = process.env.STREAMELEMENTS_CLIENT_ID;
  const redirectUri = process.env.STREAMELEMENTS_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Missing StreamElements OAuth environment variables." },
      { status: 500 }
    );
  }

  if (!userId) {
    return NextResponse.json({ error: "Missing user ID." }, { status: 400 });
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    state: userId,
  });

  return NextResponse.redirect(
    `https://api.streamelements.com/oauth2/authorize?${params.toString()}`
  );
}