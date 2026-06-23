import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const userId = searchParams.get("user_id");
  const accountId = searchParams.get("account_id");

  if (!userId || !accountId) {
    return NextResponse.json(
      { error: "Missing Stripe user_id or account_id." },
      { status: 400 }
    );
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const stripeAccount = await fetchStripeAccount(accountId);

    const { error } = await supabaseAdmin
      .from("connected_accounts")
      .update({
        account_name:
          stripeAccount?.business_profile?.name ||
          stripeAccount?.settings?.dashboard?.display_name ||
          stripeAccount?.email ||
          "Stripe",
        sync_status: "connected",
        sync_error: null,
        metadata: {
          stripe: {
            account_id: accountId,
            email: stripeAccount?.email || null,
            country: stripeAccount?.country || null,
            default_currency: stripeAccount?.default_currency || null,
            charges_enabled: stripeAccount?.charges_enabled || false,
            payouts_enabled: stripeAccount?.payouts_enabled || false,
            details_submitted: stripeAccount?.details_submitted || false,
          },
        },
        last_synced_at: new Date().toISOString(),
        last_sync_attempt_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("platform", "stripe")
      .eq("account_id", accountId);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/connected-accounts`
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to complete Stripe onboarding.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}