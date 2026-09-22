import PlatformHero from "@/components/platforms/PlatformHero";
import PlatformSummaryBar from "@/components/platforms/PlatformSummaryBar";
import PlatformGrid from "@/components/platforms/PlatformGrid";
import RecommendedConnections from "@/components/platforms/RecommendedConnections";
import buildPlatformHubData from "@/lib/simulation/hub/buildPlatformHubData";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import getPlatformSyncAllowance from "@/lib/entitlements/getPlatformSyncAllowance";
import PlatformEmptyState from "@/components/platforms/PlatformEmptyState";
import getPlatformConnectionStatus from "@/lib/platforms/getPlatformConnectionStatus";
import formatPlatformConnectionError from "@/lib/platforms/formatPlatformConnectionError";
import { getPlatformHubConnectionScenario } from "@/lib/simulation/diagnostics/platformHubConnectionScenarios";
import { getPlatformHubHealthScenario } from "@/lib/simulation/diagnostics/platformHubHealthScenarios";
import buildPlatformRecommendations from "@/lib/platforms/buildPlatformRecommendations";

import {
  platformHubMockData,
} from "@/components/platforms/platformHubMockData";

function formatRelativeSyncTime(
  value,
  now = new Date()
) {
  if (!value) {
    return "Not synced yet";
  }

  const syncedAt =
    new Date(value);

  const differenceMs =
    now.getTime() -
    syncedAt.getTime();

  if (
    !Number.isFinite(
      differenceMs
    )
  ) {
    return "Not synced yet";
  }

  const minutes =
    Math.max(
      0,
      Math.floor(
        differenceMs /
          (60 * 1000)
      )
    );

  if (minutes < 1) {
    return "just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  if (hours < 24) {
    return `${hours} ${
      hours === 1
        ? "hour"
        : "hours"
    } ago`;
  }

  const days =
    Math.floor(
      hours / 24
    );

  return `${days} ${
    days === 1
      ? "day"
      : "days"
  } ago`;
}

export default async function PlatformsPage({
  searchParams,
}) {
  const resolvedSearchParams =
    await searchParams;

  const requestedConnectionScenario =
    resolvedSearchParams
      ?.connectionScenario ||
    null;

  const requestedSyncAllowanceScenario =
    resolvedSearchParams
      ?.syncAllowanceScenario ||
    null;

  const requestedHealthScenario =
    resolvedSearchParams
      ?.healthScenario ||
    null;

  const requestedRecommendationScenario =
    resolvedSearchParams
      ?.recommendationScenario ||
    null;

  const supabase =
    await createSupabaseServerClient();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();

  let metricPreferences = {};
  let creatorTimeZone = "UTC";
  let connectedAccounts = [];

  if (user) {
    const {
      data: preferenceData,
    } =
      await supabase
        .from(
          "creator_preferences"
        )
        .select(
          "platform_hub"
        )
        .eq(
          "user_id",
          user.id
        )
        .maybeSingle();

    metricPreferences =
      preferenceData
        ?.platform_hub
        ?.metricSelections ||
      {};

    const {
    data: creatorData,
  } =
    await supabase
      .from("creators")
      .select("time_zone")
      .eq(
        "user_id",
        user.id
      )
      .maybeSingle();

  creatorTimeZone =
    creatorData?.time_zone ||
    "UTC";

    const {
      data: accountData,
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
            sync_error,
            last_synced_at,
            last_sync_attempt_at
          `
        )
        .eq(
          "user_id",
          user.id
        );

    connectedAccounts =
      accountData || [];
  }

  const useSimulation =
    process.env
      .CREATORSHUB_USE_SIMULATION ===
    "true";

  const diagnosticsEnabled =
    useSimulation &&
    process.env
      .CREATORSHUB_ENABLE_DIAGNOSTICS ===
      "true";

  const syncAllowance =
    user
      ? await getPlatformSyncAllowance({
          supabase,
          userId:
            user.id,

          timeZone:
            creatorTimeZone,
        })
      : {
          allowed: false,
          used: 0,
          limit: 0,
          remaining: 0,
          resetsAt: null,
          reason:
            "unauthenticated",
          timeZone:
            creatorTimeZone,
        };

  const effectiveSyncAllowance =
    diagnosticsEnabled &&
    requestedSyncAllowanceScenario ===
      "limitReached"
      ? {
          ...syncAllowance,

          allowed: false,

          used:
            syncAllowance.limit,

          remaining: 0,

          reason:
            "daily_limit_reached",
        }
      : syncAllowance;

  const connectionScenario =
    diagnosticsEnabled
      ? getPlatformHubConnectionScenario(
          requestedConnectionScenario
        )
      : null;

  const healthScenario =
    diagnosticsEnabled
      ? getPlatformHubHealthScenario(
          requestedHealthScenario
        )
      : null;

  const platforms =
    useSimulation
      ? buildPlatformHubData({
          platforms:
            platformHubMockData,

          connectionScenario,

          healthScenario,
        })
      : [];

  const platformsWithConnectionState =
    platforms.map(
      (platform) => {
        const matchingAccount =
          connectedAccounts.find(
            (account) =>
              account.platform ===
              platform.key
          );

        const hasDiagnosticOverride =
          Boolean(
            connectionScenario?.[
              platform.key
            ]
          );

        if (
          !matchingAccount ||
          hasDiagnosticOverride
        ) {
          return platform;
        }

        const connectionStatus =
          getPlatformConnectionStatus(
            matchingAccount
          );

        const connectionError =
          formatPlatformConnectionError({
            platformKey:
              platform.key,

            error:
              matchingAccount.sync_error,

            connectionStatus,
          });

        return {
          ...platform,

          connectionStatus,

          connectionError,

          lastSynced:
            formatRelativeSyncTime(
              matchingAccount.last_synced_at
            ),

          lastSyncedAt:
            matchingAccount.last_synced_at,

          lastSyncAttemptAt:
            matchingAccount.last_sync_attempt_at,

          lastSyncAttempt:
            matchingAccount.last_sync_attempt_at
              ? formatRelativeSyncTime(
                  matchingAccount.last_sync_attempt_at
                )
              : null,
        };
      }
    );

  const connectionIssueCount =
    platformsWithConnectionState.filter(
      (platform) =>
        platform.connectionStatus ===
          "sync_error" ||
        platform.connectionStatus ===
          "reauth_required"
    ).length;

  const reauthRequiredCount =
    platformsWithConnectionState.filter(
      (platform) =>
        platform.connectionStatus ===
        "reauth_required"
    ).length;

  const successfulSyncDates =
    connectedAccounts
      .map((account) =>
        account.last_synced_at
          ? new Date(
              account.last_synced_at
            )
          : null
      )
      .filter(
        (date) =>
          date &&
          Number.isFinite(
            date.getTime()
          )
      );

  const latestSuccessfulSync =
    successfulSyncDates.length
      ? new Date(
          Math.max(
            ...successfulSyncDates.map(
              (date) =>
                date.getTime()
            )
          )
        )
      : null;

  const syncOverview = {
    issueCount:
      connectionIssueCount,

    reauthRequiredCount,

    syncableCount:
      platformsWithConnectionState.filter(
        (platform) =>
          platform.connectionStatus ===
          "connected"
      ).length,

    totalConnectionCount:
      platformsWithConnectionState.length,

    lastSynced:
      latestSuccessfulSync
        ? formatRelativeSyncTime(
            latestSuccessfulSync
          )
        : "Not synced yet",
  };

  const hasConnectedPlatforms =
    platformsWithConnectionState.length >
    0;

  const recommendationConnectedPlatformKeys =
    diagnosticsEnabled &&
    requestedRecommendationScenario ===
      "noneConnected"
      ? []
      : useSimulation
        ? platformsWithConnectionState.map(
            (platform) =>
              platform.key
          )
        : [
            ...new Set(
              connectedAccounts
                .map(
                  (account) =>
                    account.platform
                )
                .filter(Boolean)
            ),
          ];

  const availableRecommendations =
    buildPlatformRecommendations({
      connectedPlatformKeys:
        recommendationConnectedPlatformKeys,

      limit: 3,
    });

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-6 text-white sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1480px] space-y-6">
        <PlatformHero
          hasConnectedPlatforms={
            hasConnectedPlatforms
          }
          syncAllowance={
            effectiveSyncAllowance
          }
          syncOverview={
            syncOverview
          }
        />

        {hasConnectedPlatforms ? (
          <>
            <PlatformSummaryBar
              platforms={
                platformsWithConnectionState
              }
            />

            <PlatformGrid
              platforms={
                platformsWithConnectionState
              }
              metricPreferences={
                metricPreferences
              }
            />
          </>
        ) : (
          <PlatformEmptyState />
        )}

        {hasConnectedPlatforms ? (
          <RecommendedConnections
            recommendations={
              availableRecommendations
            }
          />
        ) : null}
      </div>
    </div>
  );
}