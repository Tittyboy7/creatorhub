"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const platforms = [
  {
    name: "YouTube",
    key: "youtube",
    description: "Sync YouTube analytics and revenue data.",
    available: true,
  },
  {
    name: "Twitch",
    key: "twitch",
    description: "Sync subscriptions, donations, and creator revenue.",
    available: false,
  },
  {
    name: "Shopify",
    key: "shopify",
    description: "Sync store sales and product revenue.",
    available: false,
  },
  {
    name: "Patreon",
    key: "patreon",
    description: "Sync memberships and creator income.",
    available: false,
  },
];

function formatDate(value) {
  if (!value) return "Not synced yet";
  return new Date(value).toLocaleString();
}

export default function ConnectedAccountsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [syncingPlatform, setSyncingPlatform] = useState("");
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

  function getAccount(platformKey) {
    return connectedAccounts.find(
      (account) => account.platform === platformKey
    );
  }

  async function handleSync(platformKey) {
    const account = getAccount(platformKey);

    if (!account) return;

    setSyncingPlatform(platformKey);
    setSyncMessage("");
    setSyncError("");

    try {
      const response = await fetch(
        `/api/sync/${platformKey}?user_id=${account.user_id}`
      );

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        setSyncError(data.error || "Sync failed.");
        return;
      }

      setSyncMessage(`Sync complete. Imported ${data.imported_rows || 0} rows.`);

      setConnectedAccounts((currentAccounts) =>
        currentAccounts.map((currentAccount) =>
          currentAccount.platform === platformKey
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
      setSyncingPlatform("");
    }
  }

  const connectedCount = connectedAccounts.length;
  const availableCount = platforms.filter((platform) => platform.available).length;
  const errorCount = connectedAccounts.filter((account) => account.sync_error).length;

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
              <p className="text-xs text-zinc-500">Connected</p>
              <p className="mt-1 text-xl font-bold">{connectedCount}</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-xs text-zinc-500">Live</p>
              <p className="mt-1 text-xl font-bold">{availableCount}</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-xs text-zinc-500">Errors</p>
              <p className="mt-1 text-xl font-bold">{errorCount}</p>
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

      <section className="grid gap-4 md:grid-cols-2">
        {platforms.map((platform) => {
          const account = getAccount(platform.key);
          const isConnected = Boolean(account);
          const hasError = Boolean(account?.sync_error);

          return (
            <div
              key={platform.key}
              className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">{platform.name}</h2>

                  <p className="mt-2 text-sm text-zinc-400">
                    {platform.description}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    hasError
                      ? "bg-red-950 text-red-400"
                      : isConnected
                      ? "bg-green-950 text-green-400"
                      : platform.available
                      ? "bg-blue-950 text-blue-400"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {hasError
                    ? "Error"
                    : isConnected
                    ? "Connected"
                    : platform.available
                    ? "Available"
                    : "Coming Soon"}
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <p className="text-xs text-zinc-500">Status</p>
                  <p className="mt-1 font-semibold capitalize">
                    {account?.sync_status || "Not connected"}
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <p className="text-xs text-zinc-500">Last Sync</p>
                  <p className="mt-1 text-sm font-semibold">
                    {formatDate(account?.last_synced_at)}
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <p className="text-xs text-zinc-500">Last Attempt</p>
                  <p className="mt-1 text-sm font-semibold">
                    {account?.last_sync_attempt_at
                      ? formatDate(account.last_sync_attempt_at)
                      : "No attempts yet"}
                  </p>
                </div>
              </div>

              {account && (
                <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <p className="text-sm text-zinc-500">Connected Account</p>

                  <p className="mt-1 font-semibold">
                    {account.account_name || account.account_id || platform.name}
                  </p>

                  <p
                    className={`mt-3 text-sm ${
                      account.sync_error ? "text-red-400" : "text-green-400"
                    }`}
                  >
                    {account.sync_error
                      ? `Error: ${account.sync_error}`
                      : "No sync errors"}
                  </p>
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/connected-accounts/${platform.key}`}
                  className={`rounded-2xl px-5 py-3 font-semibold ${
                    platform.available
                      ? "bg-white text-black hover:bg-zinc-200"
                      : "border border-zinc-700 text-zinc-500"
                  }`}
                >
                  {isConnected ? "Manage" : platform.available ? "Connect" : "Preview"}
                </Link>

                {account && (
                  <button
                    onClick={() => handleSync(platform.key)}
                    disabled={syncingPlatform === platform.key}
                    className="rounded-2xl border border-zinc-700 px-5 py-3 font-semibold hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {syncingPlatform === platform.key ? "Syncing..." : "Sync Now"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}