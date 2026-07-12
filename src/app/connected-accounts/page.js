"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { platforms } from "@/lib/platforms";
import PlatformAccountGroup from "@/components/platforms/accounts/PlatformAccountGroup";
import AvailablePlatformCard from "@/components/platforms/accounts/AvailablePlatformCard";

function formatDate(value) {
  if (!value) return "Not synced yet";
  return new Date(value).toLocaleString();
}

export default function ConnectedAccountsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [syncingAccountId, setSyncingAccountId] = useState("");
  const [syncMessage, setSyncMessage] = useState("");
  const [syncError, setSyncError] = useState("");

  useEffect(() => {
    async function loadConnectedAccounts() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("connected_accounts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        alert(error.message);
      } else {
        setConnectedAccounts(data || []);
      }

      setLoading(false);
    }

    loadConnectedAccounts();
  }, [router]);

  async function handleSync(account) {
    if (!account) return;

    const platformKey = account.platform;

    setSyncingAccountId(account.id);
    setSyncMessage("");
    setSyncError("");

    try {
      const usesSecureAccountSync = ["youtube", "twitch"].includes(
        platformKey
      );

      const response = usesSecureAccountSync
        ? await fetch(`/api/sync/${platformKey}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              connectedAccountId: account.id,
            }),
          })
        : await fetch(
            `/api/sync/${platformKey}?user_id=${account.user_id}`
          );

      const text = await response.text();

      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }

      if (!response.ok) {
        const accountDisplayName =
          account.account_name ||
          account.account_id ||
          platformKey;

        setSyncError(
          `${accountDisplayName}: ${data.error || "Sync failed."}`
        );
        return;
      }

      const warningMessage = Array.isArray(data.warnings)
        ? data.warnings.join(" ")
        : "";

      const accountDisplayName =
        account.account_name ||
        account.account_id ||
        platformKey;

      setSyncMessage(
        [
          `${accountDisplayName}:`,
          data.message || "Sync completed successfully.",
          warningMessage,
        ]
          .filter(Boolean)
          .join(" ")
      );

      setConnectedAccounts((currentAccounts) =>
        currentAccounts.map((currentAccount) =>
          currentAccount.id === account.id
            ? {
                ...currentAccount,
                last_synced_at: new Date().toISOString(),
                last_sync_attempt_at: new Date().toISOString(),
                sync_status: "connected",
                sync_error: null,
              }
            : currentAccount
        )
      );
    } catch (error) {
      setSyncError(error.message || "Sync failed.");
    } finally {
      setSyncingAccountId("");
    }
  }

  const connectedAccountCount = connectedAccounts.length;

  const connectedPlatformCount = new Set(
    connectedAccounts.map((account) => account.platform)
  ).size;

  const errorCount = connectedAccounts.filter(
    (account) => account.sync_error
  ).length;

  const orderedPlatforms = [...platforms].sort((a, b) => {
    const aAccounts = connectedAccounts.filter(
      (account) => account.platform === a.key
    );

    const bAccounts = connectedAccounts.filter(
      (account) => account.platform === b.key
    );

    const aHasError = aAccounts.some((account) => account.sync_error);
    const bHasError = bAccounts.some((account) => account.sync_error);

    if (aHasError !== bHasError) {
      return aHasError ? -1 : 1;
    }

    if (aAccounts.length !== bAccounts.length) {
      return bAccounts.length - aAccounts.length;
    }

    if (a.available !== b.available) {
      return a.available ? -1 : 1;
    }

    return a.name.localeCompare(b.name);
  });

  if (loading) {
    return <p className="text-zinc-400">Loading connected accounts...</p>;
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="inline-block rounded-2xl border border-zinc-700 px-5 py-3 hover:bg-zinc-800"
      >
        Back to Dashboard
      </Link>

      <section className="rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Integrations
        </p>

        <div className="mt-2 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold">Connected Accounts</h1>

            <p className="mt-4 max-w-3xl text-zinc-400">
              Connect creator platforms to sync revenue, analytics, and account
              data into CreatorsHub.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-xs text-zinc-500">Accounts</p>
              <p className="mt-1 text-xl font-bold">{connectedAccountCount}</p>
              <p className="mt-1 text-xs text-zinc-600">Connected</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-xs text-zinc-500">Platforms</p>
              <p className="mt-1 text-xl font-bold">{connectedPlatformCount}</p>
              <p className="mt-1 text-xs text-zinc-600">In use</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-xs text-zinc-500">Attention</p>
              <p className="mt-1 text-xl font-bold">{errorCount}</p>
              <p className="mt-1 text-xs text-zinc-600">Sync errors</p>
            </div>
          </div>
        </div>
      </section>

      {syncMessage && (
        <div className="rounded-2xl border border-green-900 bg-green-950 p-4 text-sm text-green-400">
          {syncMessage}
        </div>
      )}

      {syncError && (
        <div className="rounded-2xl border border-red-900 bg-red-950 p-4 text-sm text-red-400">
          {syncError}
        </div>
      )}

      <div className="space-y-6">
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-white">
              Connected Platforms
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Manage each connected channel, store, or account independently.
            </p>
          </div>

          {connectedPlatformCount > 0 ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {orderedPlatforms
                .filter((platform) =>
                  connectedAccounts.some(
                    (account) => account.platform === platform.key
                  )
                )
                .map((platform) => {
                  const platformAccounts = connectedAccounts.filter(
                    (account) => account.platform === platform.key
                  );

                  return (
                    <PlatformAccountGroup
                      key={platform.key}
                      platform={platform}
                      accounts={platformAccounts}
                      syncingAccountId={syncingAccountId}
                      onSync={handleSync}
                    />
                  );
                })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900 p-6">
              <p className="font-semibold text-white">
                No connected platforms yet
              </p>

              <p className="mt-2 text-sm text-zinc-500">
                Connect your first platform below to begin syncing creator-business data.
              </p>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-white">
              Available Connections
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Add more platforms when they help complete your business picture.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {orderedPlatforms
              .filter(
                (platform) =>
                  !connectedAccounts.some(
                    (account) => account.platform === platform.key
                  )
              )
              .map((platform) => (
                <AvailablePlatformCard
                  key={platform.key}
                  platform={platform}
                />
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}