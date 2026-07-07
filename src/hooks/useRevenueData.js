"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const SYNCABLE_REVENUE_PLATFORMS = [
  "youtube",
  "stripe",
  "shopify",
  "paypal",
  "patreon",
  "kick",
  "twitch",
  "streamlabs",
  "streamelements",
];

export function useRevenueData() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [userId, setUserId] = useState(null);
  const [entries, setEntries] = useState([]);
  const [connectedAccounts, setConnectedAccounts] = useState([]);

  const loadRevenueData = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setUserId(user.id);

    const { data: revenueData, error: revenueError } = await supabase
      .from("revenue_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("entry_month", { ascending: false });

    if (revenueError) {
      alert(revenueError.message);
    } else {
      setEntries(revenueData || []);
    }

    const { data: accountData, error: accountError } = await supabase
      .from("connected_accounts")
      .select("*")
      .eq("user_id", user.id);

    if (accountError) {
      alert(accountError.message);
    } else {
      setConnectedAccounts(accountData || []);
    }

    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadRevenueData();
  }, [loadRevenueData]);

  async function handleSyncAll() {
    if (!userId || syncing) return;

    const syncableAccounts = connectedAccounts.filter((account) =>
      SYNCABLE_REVENUE_PLATFORMS.includes(
        String(account.platform || "").toLowerCase()
      )
    );

    if (syncableAccounts.length === 0) {
      alert("No syncable revenue platforms are connected yet.");
      return;
    }

    setSyncing(true);
    setSyncMessage("Syncing revenue platforms...");

    try {
      const results = await Promise.allSettled(
        syncableAccounts.map((account) =>
          fetch(`/api/sync/${String(account.platform).toLowerCase()}?user_id=${userId}`)
        )
      );

      const failedCount = results.filter(
        (result) => result.status === "rejected" || !result.value?.ok
      ).length;

      await loadRevenueData();

      if (failedCount > 0) {
        setSyncMessage(
          `${failedCount} platform sync${failedCount === 1 ? "" : "s"} failed. Some connections may need to be refreshed.`
        );
      } else {
        setSyncMessage("Revenue data synced successfully.");
      }
    } finally {
      setSyncing(false);
    }
  }

  async function handleDeleteEntry(entryId) {
    const confirmed = confirm(
      "Are you sure you want to delete this revenue entry?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("revenue_entries")
      .delete()
      .eq("id", entryId);

    if (error) {
      alert(error.message);
      return;
    }

    setEntries((currentEntries) =>
      currentEntries.filter((entry) => entry.id !== entryId)
    );
  }

  return {
    loading,
    syncing,
    entries,
    connectedAccounts,
    handleSyncAll,
    handleDeleteEntry,
    syncMessage,
  };
}