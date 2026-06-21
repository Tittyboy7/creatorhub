"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function useRevenueData() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [connectedAccounts, setConnectedAccounts] = useState([]);

  useEffect(() => {
    async function loadRevenueData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

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
    }

    loadRevenueData();
  }, [router]);

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
    entries,
    connectedAccounts,
    handleDeleteEntry,
  };
}