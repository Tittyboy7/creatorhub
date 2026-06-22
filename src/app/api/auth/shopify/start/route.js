import { NextResponse } from "next/server";

function normalizeShopDomain(shop) {
  return shop
    .trim()
    .replace("https://", "")
    .replace("http://", "")
    .replace(/\/$/, "");
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const userId = searchParams.get("user_id");
  const shop = searchParams.get("shop");

  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const redirectUri = process.env.SHOPIFY_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Missing Shopify OAuth environment variables." },
      { status: 500 }
    );
  }

  if (!userId) {
    return NextResponse.json({ error: "Missing user ID." }, { status: 400 });
  }

  if (!shop) {
    return NextResponse.json({ error: "Missing Shopify shop domain." }, { status: 400 });
  }

  const normalizedShop = normalizeShopDomain(shop);

  const params = new URLSearchParams({
    client_id: clientId,
    scope: "read_products,read_orders",
    redirect_uri: redirectUri,
    state: userId,
  });

  return NextResponse.redirect(
    `https://${normalizedShop}/admin/oauth/authorize?${params.toString()}`
  );
}