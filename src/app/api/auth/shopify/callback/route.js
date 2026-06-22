import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function normalizeShopDomain(shop) {
  return shop
    .trim()
    .replace("https://", "")
    .replace("http://", "")
    .replace(/\/$/, "");
}

async function fetchShopInfo(shop, accessToken) {
  const response = await fetch(
    `https://${shop}/admin/api/2025-10/shop.json`,
    {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data.shop;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const code = searchParams.get("code");
  const shop = searchParams.get("shop");
  const userId = searchParams.get("state");

  if (!code) {
    return NextResponse.json(
      { error: "No authorization code received." },
      { status: 400 }
    );
  }

  if (!shop) {
    return NextResponse.json(
      { error: "No Shopify shop received." },
      { status: 400 }
    );
  }

  if (!userId) {
    return NextResponse.json(
      { error: "No user ID received." },
      { status: 400 }
    );
  }

  const normalizedShop = normalizeShopDomain(shop);

  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!clientId || !clientSecret || !supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Missing required Shopify environment variables." },
      { status: 500 }
    );
  }

  const tokenResponse = await fetch(
    `https://${normalizedShop}/admin/oauth/access_token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    }
  );

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok) {
    return NextResponse.json(
      {
        error: "Failed to exchange Shopify authorization code.",
        details: tokenData,
      },
      { status: 500 }
    );
  }

  const accessToken = tokenData.access_token;

  let shopInfo = null;

  try {
    shopInfo = await fetchShopInfo(normalizedShop, accessToken);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch Shopify shop info.",
        details: error.message,
      },
      { status: 500 }
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  const { error } = await supabaseAdmin.from("connected_accounts").upsert(
    {
      user_id: userId,
      platform: "shopify",
      account_id: normalizedShop,
      account_name: shopInfo?.name || normalizedShop,
      access_token: accessToken,
      refresh_token: null,
      expires_at: null,
      sync_status: "connected",
      sync_error: null,
      metadata: {
        shopify: {
          shop_domain: normalizedShop,
          shop_id: shopInfo?.id || null,
          name: shopInfo?.name || normalizedShop,
          email: shopInfo?.email || null,
          currency: shopInfo?.currency || null,
          plan_name: shopInfo?.plan_name || null,
          country_name: shopInfo?.country_name || null,
        },
      },
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,platform,account_id",
    }
  );

  if (error) {
    return NextResponse.json(
      {
        error: "Failed to save Shopify connected account.",
        details: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_SITE_URL}/connected-accounts`
  );
}