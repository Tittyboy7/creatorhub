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
    status: "Coming soon",
  },
  {
    name: "Twitch",
    key: "twitch",
    description: "Sync subscriptions, donations, and creator revenue.",
    status: "Coming soon",
  },
  {
    name: "Shopify",
    key: "shopify",
    description: "Sync store sales and product revenue.",
    status: "Coming soon",
  },
  {
    name: "Patreon",
    key: "patreon",
    description: "Sync memberships and creator income.",
    status: "Coming soon",
  },
];

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

        <h1 className="mt-2 text-4xl font-bold">Connected Accounts</h1>

        <p className="mt-4 max-w-3xl text-zinc-400">
          Connect platforms like YouTube, Twitch, Shopify, and Patreon to sync
          creator revenue automatically in the future.
        </p>
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
                    account
                      ? "bg-green-950 text-green-400"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {account ? "Connected" : platform.status}
                </span>
              </div>

              {account && (
                <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <p className="text-sm text-zinc-500">Account</p>
                  <p className="mt-1 font-semibold">
                    {account.account_name || account.account_id || platform.name}
                  </p>

                  <p className="mt-3 text-sm text-zinc-500">
                    Last synced:{" "}
                    {account.last_synced_at
                      ? new Date(account.last_synced_at).toLocaleString()
                      : "Not synced yet"}
                  </p>

                  <p className="mt-2 text-sm text-zinc-500">
                    Last sync attempt:{" "}
                    {account.last_sync_attempt_at
                      ? new Date(account.last_sync_attempt_at).toLocaleString()
                      : "No attempts yet"}
                  </p>

                  <p
                    className={`mt-2 text-sm ${
                      account.sync_error ? "text-red-400" : "text-green-400"
                    }`}
                  >
                    {account.sync_error ? `Error: ${account.sync_error}` : "No sync errors"}
                  </p>
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/connected-accounts/${platform.key}`}
                  className="rounded-2xl bg-white px-5 py-3 font-semibold text-black hover:bg-zinc-200"
                >
                  {account ? "Manage" : "Connect"}
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