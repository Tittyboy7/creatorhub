import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

async function createStripeAccount() {
  const response = await fetch("https://api.stripe.com/v1/accounts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      type: "express",
      country: "US",
      "capabilities[card_payments][requested]": "true",
      "capabilities[transfers][requested]": "true",
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
}

async function createStripeAccountLink({ accountId, userId }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  const response = await fetch("https://api.stripe.com/v1/account_links", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      account: accountId,
      refresh_url: `${siteUrl}/connected-accounts/stripe`,
      return_url: `${siteUrl}/api/auth/stripe/callback?user_id=${userId}&account_id=${accountId}`,
      type: "account_onboarding",
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
  const userId = searchParams.get("user_id");

  if (!userId) {
    return NextResponse.json({ error: "Missing user ID." }, { status: 400 });
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.NEXT_PUBLIC_SITE_URL) {
    return NextResponse.json(
      { error: "Missing Stripe environment variables." },
      { status: 500 }
    );
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const { data: existingAccount } = await supabaseAdmin
      .from("connected_accounts")
      .select("*")
      .eq("user_id", userId)
      .eq("platform", "stripe")
      .maybeSingle();

    let stripeAccountId = existingAccount?.account_id;

    if (!stripeAccountId) {
      const stripeAccount = await createStripeAccount();
      stripeAccountId = stripeAccount.id;

      await supabaseAdmin.from("connected_accounts").insert({
        user_id: userId,
        platform: "stripe",
        account_id: stripeAccountId,
        account_name: "Stripe",
        access_token: null,
        refresh_token: null,
        expires_at: null,
        sync_status: "onboarding",
        sync_error: null,
        metadata: {
          stripe: {
            account_id: stripeAccountId,
            onboarding_started: true,
          },
        },
        updated_at: new Date().toISOString(),
      });
    }

    const accountLink = await createStripeAccountLink({
      accountId: stripeAccountId,
      userId,
    });

    return NextResponse.redirect(accountLink.url);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to start Stripe onboarding.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}