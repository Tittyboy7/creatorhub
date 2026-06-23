import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const redirectUri = process.env.PAYPAL_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Missing PayPal OAuth environment variables." },
      { status: 500 }
    );
  }

  if (!userId) {
    return NextResponse.json({ error: "Missing user ID." }, { status: 400 });
  }

  const params = new URLSearchParams({
    flowEntry: "static",
    client_id: clientId,
    response_type: "code",
    scope: "openid profile email",
    redirect_uri: redirectUri,
    state: userId,
  }); 

  return NextResponse.redirect(
    `https://www.sandbox.paypal.com/signin/authorize?${params.toString()}`
  );
}