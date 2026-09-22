import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import getPlatformSyncAllowance from "@/lib/entitlements/getPlatformSyncAllowance";

export async function POST() {

  const useSimulation =
    process.env
      .CREATORSHUB_USE_SIMULATION ===
    "true";  

  const supabase =
    await createSupabaseServerClient();

  const {
    data: {
      user,
    },
    error: userError,
  } =
    await supabase.auth.getUser();

  if (
    userError ||
    !user
  ) {
    return NextResponse.json(
      {
        success: false,
        reason: "unauthenticated",
        message:
          "You must be signed in to sync platforms.",
      },
      {
        status: 401,
      }
    );
  }

  const {
    data: creator,
    error: creatorError,
  } =
    await supabase
      .from("creators")
      .select(
        "time_zone"
      )
      .eq(
        "user_id",
        user.id
      )
      .maybeSingle();

  if (creatorError) {
    return NextResponse.json(
      {
        success: false,
        reason:
          "creator_lookup_failed",
        message:
          "We could not load your creator settings.",
      },
      {
        status: 500,
      }
    );
  }

  const timeZone =
    creator?.time_zone ||
    "UTC";

  const {
    data: connectedAccounts,
    error: accountsError,
  } =
    await supabase
      .from(
        "connected_accounts"
      )
      .select(
        `
          id,
          platform,
          account_name,
          account_id,
          sync_status,
          last_synced_at,
          last_sync_attempt_at
        `
      )
      .eq(
        "user_id",
        user.id
      );

  if (accountsError) {
    return NextResponse.json(
      {
        success: false,
        reason:
          "connections_lookup_failed",
        message:
          "We could not load your connected platforms.",
      },
      {
        status: 500,
      }
    );
  }

  if (
    !connectedAccounts ||
    connectedAccounts.length === 0
  ) {
    return NextResponse.json(
      {
        success: false,
        reason:
          "no_connected_platforms",
        message:
          "There are no connected platforms to sync.",
      },
      {
        status: 400,
      }
    );
  }

  const syncableAccounts =
    connectedAccounts.filter(
      (account) =>
        account.sync_status ===
        "connected"
    );

  const skippedAccounts =
    connectedAccounts.filter(
      (account) =>
        account.sync_status !==
        "connected"
    );

  const skippedConnections =
    skippedAccounts.map(
      (account) => ({
        id:
          account.id,

        platform:
          account.platform,

        accountName:
          account.account_name ||
          account.account_id ||
          account.platform,

        status:
          account.sync_status,
      })
    );

  if (
    syncableAccounts.length === 0
  ) {
    return NextResponse.json(
      {
        success: false,

        reason:
          "no_syncable_platforms",

        message:
          "Your connected platforms need attention before they can be synced.",

        skippedConnections,
      },
      {
        status: 409,
      }
    );
  }

  const allowance =
    await getPlatformSyncAllowance({
      supabase,
      userId:
        user.id,
      timeZone,
    });

  if (!allowance.allowed) {
    return NextResponse.json(
      {
        success: false,
        reason:
          allowance.reason,
        message:
          allowance.reason ===
          "daily_limit_reached"
            ? "You have used all of your manual platform syncs for today."
            : "Your platform sync allowance could not be verified.",
        allowance,
      },
      {
        status:
          allowance.reason ===
          "daily_limit_reached"
            ? 429
            : 500,
      }
    );
  }

  const platforms = [
    ...new Set(
      syncableAccounts
        .map(
          (account) =>
            account.platform
        )
        .filter(Boolean)
    ),
  ];

  /*
   * DEVELOPMENT SYNC BOUNDARY
   *
   * Real provider synchronization will eventually
   * happen here.
   *
   * We deliberately do NOT update last_synced_at yet,
   * because no external provider data has actually
   * been refreshed in this development implementation.
   */

  if (useSimulation) {
  return NextResponse.json({
    success: true,

    mode:
      "simulation",

    providerSyncPerformed:
      false,

    platforms,

    connectedAccountCount:
      connectedAccounts.length,

    syncableAccountCount:
      syncableAccounts.length,

    skippedAccountCount:
      skippedAccounts.length,

    skippedConnections,

    allowance,

    message:
      skippedAccounts.length > 0
        ? `Simulation sync completed for ${syncableAccounts.length} ${
            syncableAccounts.length === 1
              ? "connection"
              : "connections"
          }. ${skippedAccounts.length} ${
            skippedAccounts.length === 1
              ? "connection needs"
              : "connections need"
          } attention.`
        : "Simulation sync completed. Daily usage was not consumed.",
  });
}

const {
  error: eventError,
} =
  await supabase
    .from(
      "platform_sync_events"
    )
    .insert({
      user_id:
        user.id,

      event_type:
        "manual_sync",

      source:
        "platform-hub",

      platforms,

      metadata: {
        mode:
          "production-development",

        providerSyncPerformed:
          false,

        connectedAccountCount:
          connectedAccounts.length,

        syncableAccountCount:
          syncableAccounts.length,

        skippedAccountCount:
          skippedAccounts.length,
      },
    });

  if (eventError) {
    return NextResponse.json(
      {
        success: false,
        reason:
          "usage_record_failed",
        message:
          "The sync request could not be recorded.",
      },
      {
        status: 500,
      }
    );
  }

  const updatedAllowance =
    await getPlatformSyncAllowance({
      supabase,
      userId:
        user.id,
      timeZone,
    });

  return NextResponse.json({
    success: true,

    mode:
      "development",

    providerSyncPerformed:
      false,

    platforms,

    connectedAccountCount:
      connectedAccounts.length,

    allowance:
      updatedAllowance,

    message:
      skippedAccounts.length > 0
        ? `Sync request recorded for ${syncableAccounts.length} ${
            syncableAccounts.length === 1
              ? "connection"
              : "connections"
          }. ${skippedAccounts.length} ${
            skippedAccounts.length === 1
              ? "connection needs"
              : "connections need"
          } attention.`
        : "Sync request recorded. Provider data refresh is not enabled yet.",

    syncableAccountCount:
      syncableAccounts.length,

    skippedAccountCount:
      skippedAccounts.length,

    skippedConnections,
  });
}