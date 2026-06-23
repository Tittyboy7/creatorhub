import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getPayPalBaseUrl() {
  return process.env.PAYPAL_ENVIRONMENT === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

function decodeJwtPayload(token) {
  if (!token) return null;

  const payload = token.split(".")[1];
  if (!payload) return null;

  return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
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
    throw new Error(JSON.stringify(data));
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
    const paypalUser = decodeJwtPayload(tokenData.id_token) || {};

    const expiresAt = new Date(
      Date.now() + Number(tokenData.expires_in || 3600) * 1000
    ).toISOString();

    const accountId =
      paypalUser.payer_id ||
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
            scope: tokenData.scope || null,
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