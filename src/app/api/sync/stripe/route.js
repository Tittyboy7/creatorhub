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

async function fetchStripeAccount(accountId) {
  const response = await fetch(`https://api.stripe.com/v1/accounts/${accountId}`, {
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
}

async function fetchStripeCharges(accountId) {
  const response = await fetch("https://api.stripe.com/v1/charges?limit=100", {
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Stripe-Account": accountId,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data.data || [];
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
    .eq("platform", "stripe")
    .single();

  if (accountError || !account) {
    return NextResponse.json(
      { error: "No connected Stripe account found." },
      { status: 404 }
    );
  }

  await updateSyncStatus(supabaseAdmin, account.id, {
    sync_status: "syncing",
    sync_error: null,
  });

  try {
    const stripeAccount = await fetchStripeAccount(account.account_id);
    const charges = await fetchStripeCharges(account.account_id);

    const successfulCharges = charges.filter((charge) => charge.paid);
    const totalRevenue = successfulCharges.reduce(
      (sum, charge) => sum + Number(charge.amount || 0),
      0
    );

    const refundedAmount = charges.reduce(
      (sum, charge) => sum + Number(charge.amount_refunded || 0),
      0
    );

    const netRevenue = totalRevenue - refundedAmount;

    const customerIds = new Set(
      charges.map((charge) => charge.customer).filter(Boolean)
    );

    const stripeMetadata = {
      ...(account.metadata?.stripe || {}),
      account_id: account.account_id,
      email: stripeAccount?.email || null,
      country: stripeAccount?.country || null,
      default_currency: stripeAccount?.default_currency || "usd",
      charges_enabled: stripeAccount?.charges_enabled || false,
      payouts_enabled: stripeAccount?.payouts_enabled || false,
      details_submitted: stripeAccount?.details_submitted || false,
      charges_count: charges.length,
      successful_payments_count: successfulCharges.length,
      customers_count: customerIds.size,
      gross_revenue: Number((totalRevenue / 100).toFixed(2)),
      refunded_amount: Number((refundedAmount / 100).toFixed(2)),
      net_revenue: Number((netRevenue / 100).toFixed(2)),
      recent_charges: successfulCharges.slice(0, 10).map((charge) => ({
        id: charge.id,
        amount: Number((Number(charge.amount || 0) / 100).toFixed(2)),
        currency: charge.currency,
        status: charge.status,
        paid: charge.paid,
        refunded: charge.refunded,
        customer: charge.customer,
        created: charge.created,
      })),
    };

    const { error: updateError } = await supabaseAdmin
      .from("connected_accounts")
      .update({
        account_name:
          stripeAccount?.business_profile?.name ||
          stripeAccount?.settings?.dashboard?.display_name ||
          stripeAccount?.email ||
          account.account_name ||
          "Stripe",
        metadata: {
          ...(account.metadata || {}),
          stripe: stripeMetadata,
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
      message: "Stripe sync completed.",
      imported_rows: successfulCharges.length,
      stripe: stripeMetadata,
    });
  } catch (error) {
    await updateSyncStatus(supabaseAdmin, account.id, {
      sync_status: "error",
      sync_error: error.message || "Stripe sync failed.",
    });

    return NextResponse.json(
      {
        error: "Stripe sync failed.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}