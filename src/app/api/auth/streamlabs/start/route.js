import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");

  const clientId = process.env.STREAMLABS_CLIENT_ID;
  const redirectUri = process.env.STREAMLABS_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Missing Streamlabs OAuth environment variables." },
      { status: 500 }
    );
  }

  if (!userId) {
    return NextResponse.json({ error: "Missing user ID." }, { status: 400 });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: ["user.read", "donations.read"].join(" "),
    state: userId,
  });

  return NextResponse.redirect(
    `https://streamlabs.com/api/v2.0/authorize?${params.toString()}`
  );
}