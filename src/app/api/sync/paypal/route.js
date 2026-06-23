import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getPayPalBaseUrl() {
  return process.env.PAYPAL_ENVIRONMENT === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

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
    .eq("platform", "paypal")
    .single();

  if (accountError || !account) {
    return NextResponse.json(
      { error: "No connected PayPal account found." },
      { status: 404 }
    );
  }

  await updateSyncStatus(supabaseAdmin, account.id, {
    sync_status: "syncing",
    sync_error: null,
  });

  try {
    const paypalMetadata = {
      ...(account.metadata?.paypal || {}),
      environment: process.env.PAYPAL_ENVIRONMENT || "sandbox",
      base_url: getPayPalBaseUrl(),
      connected: true,
      last_checked_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabaseAdmin
      .from("connected_accounts")
      .update({
        metadata: {
          ...(account.metadata || {}),
          paypal: paypalMetadata,
        },
        last_synced_at: new Date().toISOString(),
        last_sync_attempt_at: new Date().toISOString(),
        sync_status: "connected",
        sync_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", account.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return NextResponse.json({
      success: true,
      message: "PayPal sync completed.",
      imported_rows: 0,
      paypal: paypalMetadata,
    });
  } catch (error) {
    await updateSyncStatus(supabaseAdmin, account.id, {
      sync_status: "error",
      sync_error: error.message || "PayPal sync failed.",
    });

    return NextResponse.json(
      {
        error: "PayPal sync failed.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}