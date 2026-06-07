"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function formatMonth(monthValue) {
  if (!monthValue) return "—";

  const [year, month] = monthValue.split("-");
  const date = new Date(Number(year), Number(month) - 1);

  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value || 0));
}

export default function DashboardRevenuePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [creator, setCreator] = useState(null);
  const [revenueEntries, setRevenueEntries] = useState([]);

  useEffect(() => {
    async function loadRevenue() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: creatorData } = await supabase
        .from("creators")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!creatorData) {
        router.push("/create-profile");
        return;
      }

      setCreator(creatorData);

      const { data, error } = await supabase
        .from("revenue_entries")
        .select("*")
        .eq("creator_id", creatorData.id)
        .order("entry_month", { ascending: false });

      if (error) {
        alert(error.message);
      } else {
        setRevenueEntries(data || []);
      }

      setLoading(false);
    }

    loadRevenue();
  }, [router]);

  const totalRevenue = revenueEntries.reduce(
    (sum, entry) => sum + Number(entry.amount || 0),
    0
  );

  const averageRevenue =
    revenueEntries.length > 0 ? totalRevenue / revenueEntries.length : 0;

    const highestRevenueEntry =
      revenueEntries.length > 0
        ? revenueEntries.reduce((highest, current) =>
            Number(current.amount) > Number(highest.amount)
              ? current
              : highest
          )
        : null;

    async function handleDeleteRevenue(entryId) {
      const confirmed = confirm(
        "Are you sure you want to permanently delete this revenue entry?"
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

  setRevenueEntries((current) =>
    current.filter((entry) => entry.id !== entryId)
  );
}

  if (loading) {
    return <p className="text-zinc-400">Loading revenue...</p>;
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold">Revenue</h2>
          <p className="mt-2 text-zinc-400">
            Manage revenue entries for {creator?.display_name}.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/import-revenue"
            className="rounded-xl border border-zinc-700 px-5 py-3 text-center font-semibold text-zinc-300 hover:bg-zinc-800"
          >
            Import CSV
          </Link>

          <Link
            href="/add-revenue"
            className="rounded-xl bg-white px-5 py-3 text-center font-semibold text-black hover:bg-zinc-200"
          >
            Add Revenue
          </Link>
        </div>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Total Revenue</p>
          <p className="mt-2 text-3xl font-bold">
            {formatCurrency(totalRevenue)}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Entries</p>
          <p className="mt-2 text-3xl font-bold">{revenueEntries.length}</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Average Entry</p>
          <p className="mt-2 text-3xl font-bold">
            {formatCurrency(averageRevenue)}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <p className="text-sm text-zinc-400">Highest Entry</p>

        <p className="mt-2 text-3xl font-bold">
          {highestRevenueEntry
            ? formatCurrency(highestRevenueEntry.amount)
            : "$0.00"}
        </p>

        <p className="mt-1 text-xs text-zinc-500">
          {highestRevenueEntry
            ? formatMonth(highestRevenueEntry.entry_month)
            : "No data"}
        </p>
      </div>

      {revenueEntries.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <h3 className="text-xl font-bold">No revenue entries yet</h3>

          <p className="mt-2 text-zinc-400">
            Start tracking income from platforms, products, sponsorships, and more.
          </p>

          <Link
            href="/add-revenue"
            className="mt-6 inline-block rounded-xl bg-white px-5 py-3 font-semibold text-black hover:bg-zinc-200"
          >
            Add your first revenue entry
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {revenueEntries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xl font-bold">{entry.platform}</h3>

                  <p className="mt-1 text-sm text-zinc-400">
                    {entry.revenue_type} · {formatMonth(entry.entry_month)}
                  </p>
                </div>

                <div className="flex flex-col items-start gap-3 sm:items-end">
                  <p className="text-2xl font-bold">
                    {formatCurrency(entry.amount)}
                  </p>

                  <div className="flex gap-2">
                    <Link
                      href={`/edit-revenue/${entry.id}`}
                      className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => handleDeleteRevenue(entry.id)}
                      className="rounded-xl border border-red-900 px-4 py-2 text-sm text-red-400 hover:bg-red-950"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              {entry.notes && (
                <p className="mt-4 whitespace-pre-wrap text-zinc-400">{entry.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}