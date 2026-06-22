import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

async function updateSyncStatus(supabaseAdmin, accountId, updates) {
  await supabaseAdmin
    .from("connected_accounts")
    .update({
      last_sync_attempt_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...updates,
    })
    .eq("id", accountId);
}

async function fetchShopifyShop(shopDomain, accessToken) {
  const response = await fetch(
    `https://${shopDomain}/admin/api/2025-10/shop.json`,
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

async function fetchShopifyProductsCount(shopDomain, accessToken) {
  const response = await fetch(
    `https://${shopDomain}/admin/api/2025-10/products/count.json`,
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

  return Number(data.count || 0);
}

async function fetchShopifyProducts(shopDomain, accessToken) {
  const response = await fetch(
    `https://${shopDomain}/admin/api/2025-10/products.json?limit=10`,
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

  return data.products || [];
}

async function fetchShopifyOrders(shopDomain, accessToken) {
  const response = await fetch(
    `https://${shopDomain}/admin/api/2025-10/orders.json?status=any&limit=250`,
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

  return data.orders || [];
}

function buildTopProducts(products) {
  return products.map((product) => {
    const firstVariant = product.variants?.[0] || null;
    const totalInventory = (product.variants || []).reduce(
      (sum, variant) => sum + Number(variant.inventory_quantity || 0),
      0
    );

    return {
      id: product.id,
      title: product.title,
      handle: product.handle,
      status: product.status,
      vendor: product.vendor,
      product_type: product.product_type,
      image_url: product.image?.src || null,
      price: firstVariant ? Number(firstVariant.price || 0) : 0,
      inventory_quantity: totalInventory,
      created_at: product.created_at,
      updated_at: product.updated_at,
    };
  });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");

  if (!userId) {
    return NextResponse.json({ error: "Missing user_id." }, { status: 400 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: account, error: accountError } = await supabaseAdmin
    .from("connected_accounts")
    .select("*")
    .eq("user_id", userId)
    .eq("platform", "shopify")
    .single();

  if (accountError || !account) {
    return NextResponse.json(
      { error: "No connected Shopify account found." },
      { status: 404 }
    );
  }

  await updateSyncStatus(supabaseAdmin, account.id, {
    sync_status: "syncing",
    sync_error: null,
  });

  try {
    const shopDomain =
      account.metadata?.shopify?.shop_domain || account.account_id;

    const shop = await fetchShopifyShop(shopDomain, account.access_token);

    const productsCount = await fetchShopifyProductsCount(
      shopDomain,
      account.access_token
    );

    const products = await fetchShopifyProducts(
      shopDomain,
      account.access_token
    );

    const orders = await fetchShopifyOrders(shopDomain, account.access_token);

    const ordersCount = orders.length;

    const totalOrderRevenue = orders.reduce(
      (sum, order) => sum + Number(order.total_price || 0),
      0
    );

    const averageOrderValue =
      ordersCount === 0 ? 0 : totalOrderRevenue / ordersCount;

    const topProducts = buildTopProducts(products);

    await supabaseAdmin
      .from("connected_accounts")
      .update({
        account_name: shop?.name || account.account_name,
        metadata: {
          ...(account.metadata || {}),
          shopify: {
            ...(account.metadata?.shopify || {}),
            shop_domain: shopDomain,
            shop_id: shop?.id || null,
            name: shop?.name || shopDomain,
            email: shop?.email || null,
            currency: shop?.currency || null,
            plan_name: shop?.plan_name || null,
            country_name: shop?.country_name || null,
            products_count: productsCount,
            orders_count: ordersCount,
            total_order_revenue: Number(totalOrderRevenue.toFixed(2)),
            average_order_value: Number(averageOrderValue.toFixed(2)),
            top_products: topProducts,
          },
        },
        last_synced_at: new Date().toISOString(),
        last_sync_attempt_at: new Date().toISOString(),
        sync_status: "connected",
        sync_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", account.id);

    return NextResponse.json({
      success: true,
      message: "Shopify sync completed.",
      imported_rows: ordersCount,
      shop,
      metrics: {
        products_count: productsCount,
        orders_count: ordersCount,
        total_order_revenue: Number(totalOrderRevenue.toFixed(2)),
        average_order_value: Number(averageOrderValue.toFixed(2)),
        top_products: topProducts,
      },
    });
  } catch (error) {
    await updateSyncStatus(supabaseAdmin, account.id, {
      sync_status: "error",
      sync_error: error.message || "Shopify sync failed.",
    });

    return NextResponse.json(
      {
        error: "Shopify sync failed.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}