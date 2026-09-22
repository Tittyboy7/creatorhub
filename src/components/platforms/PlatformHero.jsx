"use client";

import Link from "next/link";
import { useState } from "react";

function SyncIcon({
  spinning = false,
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={`h-4 w-4 ${
        spinning
          ? "animate-spin"
          : ""
      }`}
    >
      <path
        d="M20 7v5h-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M4 17v-5h5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M6.1 8.5A7 7 0 0 1 18.6 7L20 12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M17.9 15.5A7 7 0 0 1 5.4 17L4 12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatResetTime({
  resetsAt,
  timeZone,
}) {
  if (!resetsAt) {
    return null;
  }

  try {
    return new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone:
          timeZone || undefined,
        hour: "numeric",
        minute: "2-digit",
      }
    ).format(
      new Date(resetsAt)
    );
  } catch {
    return null;
  }
}

export default function PlatformHero({
  hasConnectedPlatforms = true,
  syncAllowance = null,
  syncOverview = null,
}) {
  const [
    syncState,
    setSyncState,
  ] =
    useState("idle");

  const [
    allowance,
    setAllowance,
  ] =
    useState(
      syncAllowance
    );

  const [
    syncMessage,
    setSyncMessage,
  ] =
    useState(null);

  const isSyncing =
    syncState === "syncing";

  const limitReached =
    allowance &&
    allowance.allowed === false &&
    allowance.reason ===
      "daily_limit_reached";

  const resetTime =
    formatResetTime({
      resetsAt:
        allowance?.resetsAt,
      timeZone:
        allowance?.timeZone,
    });

  async function handleSync() {
    if (
      isSyncing ||
      limitReached ||
      hasNoSyncableConnections
    ) {
      return;
    }

    setSyncState(
      "syncing"
    );

    setSyncMessage(null);

    try {
      const response =
        await fetch(
          "/api/platforms/sync",
          {
            method: "POST",
          }
        );

      const result =
        await response.json();

      if (
        result?.allowance
      ) {
        setAllowance(
          result.allowance
        );
      }

      if (!response.ok) {
        if (
          result?.reason ===
          "daily_limit_reached"
        ) {
          setSyncState(
            "limit"
          );

          setSyncMessage(
            result.message
          );

          return;
        }

        setSyncState(
          "error"
        );

        setSyncMessage(
          result?.message ||
            "We could not sync your platforms."
        );

        return;
      }

      setSyncMessage(
        result?.message ||
          (result?.mode ===
          "simulation"
            ? "Simulation sync completed."
            : "Sync request completed.")
      );

      window.setTimeout(
        () => {
          setSyncState(
            "idle"
          );

          setSyncMessage(
            null
          );
        },
        2200
      );
    } catch {
      setSyncState(
        "error"
      );

      setSyncMessage(
        "We could not reach the sync service."
      );
    }
  }

  const connectionIssueCount =
    syncOverview?.issueCount || 0;

  const reauthRequiredCount =
    syncOverview
      ?.reauthRequiredCount || 0;

  const hasConnectionIssues =
    connectionIssueCount > 0;

  const syncableCount =
    syncOverview?.syncableCount || 0;

  const totalConnectionCount =
    syncOverview
      ?.totalConnectionCount || 0;

  const hasPartialSync =
    hasConnectionIssues &&
    syncableCount > 0;

  const hasNoSyncableConnections =
    totalConnectionCount > 0 &&
    syncableCount === 0;

  const idleSyncTitle =
    reauthRequiredCount > 0
      ? `${reauthRequiredCount} ${
          reauthRequiredCount === 1
            ? "connection needs"
            : "connections need"
        } reconnecting`
      : hasConnectionIssues
        ? `${connectionIssueCount} connection ${
            connectionIssueCount === 1
              ? "issue"
              : "issues"
          }`
        : syncOverview?.lastSynced &&
            syncOverview.lastSynced !==
              "Not synced yet"
          ? `Last synced ${syncOverview.lastSynced}`
          : "Ready to sync";

  const idleSyncHelper =
    reauthRequiredCount > 0
      ? "Reconnect the affected platform to resume syncing."
      : hasConnectionIssues
        ? "Review the affected connection below."
        : syncOverview?.lastSynced ===
            "Not synced yet"
          ? "Run a sync to refresh your platform data."
          : "No connection issues detected";

  function getButtonLabel() {
    if (isSyncing) {
      return "Syncing...";
    }

    if (
      syncState ===
      "success"
    ) {
      return "Synced";
    }

    if (limitReached) {
      return "Manual Sync Limit Reached";
    }

    if (hasNoSyncableConnections) {
      return "Connections Need Attention";
    }

    if (hasPartialSync) {
      return "Sync Available Platforms";
    }

    return "Sync All Platforms";
  }

  return (
    <section className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
          Platform Hub
        </h1>

        <p className="mt-2 text-sm leading-6 text-zinc-400 md:text-base">
          All your platforms. All your data. One place.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        {hasConnectedPlatforms ? (
          <>
            <div className="flex flex-col">
              <button
                type="button"
                onClick={
                  handleSync
                }
                disabled={
                  isSyncing ||
                  limitReached ||
                  hasNoSyncableConnections
                }
                className={`
                  inline-flex
                  min-h-12
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  border
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  shadow-[0_10px_30px_rgba(0,0,0,0.18)]
                  transition
                  ${
                    limitReached ||
                    hasNoSyncableConnections
                      ? "cursor-not-allowed border-zinc-800 bg-zinc-900/50 text-zinc-600"
                      : "border-zinc-700 bg-zinc-900/80 text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
                  }
                `}
              >
                <SyncIcon
                  spinning={
                    isSyncing
                  }
                />

                {getButtonLabel()}
              </button>

              {allowance ? (
                <p className="mt-2 text-center text-xs text-zinc-500">
                  {allowance.remaining} of{" "}
                  {allowance.limit} manual sync
                  {allowance.limit === 1
                    ? ""
                    : "s"}{" "}
                  remaining today
                </p>
              ) : null}
            </div>

            <div
              className="
                flex
                min-h-12
                items-center
                gap-3
                rounded-2xl
                border
                border-zinc-800
                bg-zinc-900/70
                px-4
                py-3
                backdrop-blur
              "
            >
              <span
                aria-hidden="true"
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                  syncState === "error" ||
                  reauthRequiredCount > 0
                    ? "bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.8)]"
                    : hasConnectionIssues
                      ? "bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.7)]"
                      : "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]"
                }`}
              />

              <div>
                <p className="text-sm font-medium text-zinc-200">
                  {syncState ===
                  "syncing"
                    ? "Sync in progress"
                    : syncState ===
                        "success"
                      ? "Sync completed"
                      : syncState ===
                          "error"
                        ? "Sync failed"
                        : limitReached
                          ? "Manual sync limit reached"
                          : idleSyncTitle}
                </p>

                <p className="mt-0.5 text-xs text-zinc-500">
                  {syncMessage
                    ? syncMessage
                    : limitReached &&
                        resetTime
                      ? `Manual syncs reset at ${resetTime}`
                      : idleSyncHelper}
                </p>
              </div>
            </div>
          </>
        ) : (
          <Link
            href="/connected-accounts"
            className="
              inline-flex
              min-h-12
              items-center
              justify-center
              gap-2
              rounded-2xl
              border
              border-zinc-700
              bg-zinc-900/80
              px-5
              py-3
              text-sm
              font-semibold
              text-zinc-200
              shadow-[0_10px_30px_rgba(0,0,0,0.18)]
              transition
              hover:border-zinc-600
              hover:bg-zinc-800
              hover:text-white
            "
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="h-4 w-4"
            >
              <path
                d="M12 5v14"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />

              <path
                d="M5 12h14"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>

            Manage Connections
          </Link>
        )}
      </div>
    </section>
  );
}