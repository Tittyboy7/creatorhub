"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function usePlatformRevenueData(platformSlug) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState(null);
  const [revenueEntries, setRevenueEntries] = useState([]);
  const [userId, setUserId] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [syncError, setSyncError] = useState("");

  const loadPlatformData = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setUserId(user.id);

    const { data: accountData, error: accountError } = await supabase
      .from("connected_accounts")
      .select("*")
      .eq("user_id", user.id)
      .eq("platform", platformSlug)
      .maybeSingle();

    if (accountError) {
      alert(accountError.message);
    } else {
      setAccount(accountData);
    }

    const { data: revenueData, error: revenueError } = await supabase
      .from("revenue_entries")
      .select("*")
      .eq("user_id", user.id)
      .eq("source_platform", platformSlug)
      .order("entry_month", { ascending: false });

    if (revenueError) {
      alert(revenueError.message);
    } else {
      setRevenueEntries(revenueData || []);
    }

    setLoading(false);
  }, [router, platformSlug]);

  useEffect(() => {
    loadPlatformData();
  }, [loadPlatformData]);

  async function handleSyncNow() {
    if (!userId) return;

    setSyncing(true);
    setSyncMessage("");
    setSyncError("");

    try {
      const response = await fetch(`/api/sync/${platformSlug}?user_id=${userId}`);
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        setSyncError(data.error || "Sync failed.");
        return;
      }

      setSyncMessage(`Sync complete. Imported ${data.imported_rows || 0} rows.`);
      await loadPlatformData();
    } catch (error) {
      setSyncError(error.message || "Sync failed.");
    } finally {
      setSyncing(false);
    }
  }

  return {
    loading,
    account,
    revenueEntries,
    syncing,
    syncMessage,
    syncError,
    handleSyncNow,
  };
}