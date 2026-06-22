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

async function fetchPatreonIdentity(accessToken) {
  const response = await fetch(
    "https://www.patreon.com/api/oauth2/v2/identity?fields%5Buser%5D=full_name,email,image_url&include=campaign",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
}

function getIncludedCampaign(identityData) {
  return identityData.included?.find((item) => item.type === "campaign") || null;
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
    .eq("platform", "patreon")
    .single();

  if (accountError || !account) {
    return NextResponse.json(
      { error: "No connected Patreon account found." },
      { status: 404 }
    );
  }

  await updateSyncStatus(supabaseAdmin, account.id, {
    sync_status: "syncing",
    sync_error: null,
  });

  try {
    const identityData = await fetchPatreonIdentity(account.access_token);
    const user = identityData.data;
    const campaign = getIncludedCampaign(identityData);

    const patreonMetadata = {
      ...(account.metadata?.patreon || {}),
      user_id: user?.id || account.account_id,
      full_name: user?.attributes?.full_name || null,
      email: user?.attributes?.email || null,
      image_url: user?.attributes?.image_url || null,
      campaign_id: campaign?.id || null,
      campaign_name: campaign?.attributes?.summary || campaign?.attributes?.name || null,
      patron_count: campaign?.attributes?.patron_count || 0,
      creation_name: campaign?.attributes?.creation_name || null,
      url: campaign?.attributes?.url || null,
    };

    const { error: updateError } = await supabaseAdmin
      .from("connected_accounts")
      .update({
        account_name:
          patreonMetadata.full_name ||
          patreonMetadata.email ||
          account.account_name ||
          "Patreon",
        metadata: {
          ...(account.metadata || {}),
          patreon: patreonMetadata,
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
      message: "Patreon sync completed.",
      imported_rows: 0,
      patreon: patreonMetadata,
    });
  } catch (error) {
    await updateSyncStatus(supabaseAdmin, account.id, {
      sync_status: "error",
      sync_error: error.message || "Patreon sync failed.",
    });

    return NextResponse.json(
      {
        error: "Patreon sync failed.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}