import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getPayPalBaseUrl() {
  return process.env.PAYPAL_ENVIRONMENT === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

async function exchangePayPalCodeForToken(code) {
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
  throw new Error(
    JSON.stringify({
      paypalError: data,
      paypalDebugId: response.headers.get("paypal-debug-id"),
      status: response.status,
      environment: process.env.PAYPAL_ENVIRONMENT,
      redirectUri: process.env.PAYPAL_REDIRECT_URI,
      clientIdStartsWith: process.env.PAYPAL_CLIENT_ID?.slice(0, 8),
      clientIdEndsWith: process.env.PAYPAL_CLIENT_ID?.slice(-8),
      hasClientSecret: !!process.env.PAYPAL_CLIENT_SECRET,
    })
  );
}

  return data;
}

async function fetchPayPalUser(accessToken) {
  const response = await fetch(
    `${getPayPalBaseUrl()}/v1/identity/oauth2/userinfo?schema=paypalv1.1`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const rawText = await response.text();

  let data = null;

  try {
    data = rawText ? JSON.parse(rawText) : null;
  } catch {
    throw new Error(
      JSON.stringify({
        error: "PayPal returned non-JSON user info response.",
        status: response.status,
        rawText,
      })
    );
  }

  if (!response.ok) {
    throw new Error(
      JSON.stringify({
        paypalError: data,
        status: response.status,
        paypalDebugId: response.headers.get("paypal-debug-id"),
      })
    );
  }

  if (!data) {
    throw new Error(
      JSON.stringify({
        error: "PayPal returned empty user info response.",
        status: response.status,
        paypalDebugId: response.headers.get("paypal-debug-id"),
      })
    );
  }

  return data;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const code = searchParams.get("code");
  const userId = searchParams.get("state");

  if (!code) {
    return NextResponse.json(
      { error: "No PayPal authorization code received." },
      { status: 400 }
    );
  }

  if (!userId) {
    return NextResponse.json(
      { error: "No user ID received." },
      { status: 400 }
    );
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const tokenData = await exchangePayPalCodeForToken(code);
    const paypalUser = await fetchPayPalUser(tokenData.access_token);

    const expiresAt = new Date(
      Date.now() + Number(tokenData.expires_in || 3600) * 1000
    ).toISOString();

    const accountId =
      paypalUser.payer_id ||
      paypalUser.user_id ||
      paypalUser.sub ||
      paypalUser.email ||
      "paypal";

    const accountName =
      paypalUser.name ||
      paypalUser.given_name ||
      paypalUser.email ||
      "PayPal";

    const { error } = await supabaseAdmin.from("connected_accounts").upsert(
      {
        user_id: userId,
        platform: "paypal",
        account_id: String(accountId),
        account_name: accountName,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || null,
        expires_at: expiresAt,
        sync_status: "connected",
        sync_error: null,
        metadata: {
          paypal: {
            user: paypalUser,
          },
        },
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,platform,account_id",
      }
    );

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/connected-accounts`
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to connect PayPal.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}