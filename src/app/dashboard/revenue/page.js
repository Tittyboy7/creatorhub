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

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
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

  const totalRevenue = revenueEntries.reduce(
    (sum, entry) => sum + Number(entry.amount || 0),
    0
  );

  const thisMonthRevenue = revenueEntries
    .filter((entry) => entry.entry_month === getCurrentMonth())
    .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);

  const platformTotals = revenueEntries.reduce((totals, entry) => {
    totals[entry.platform] =
      (totals[entry.platform] || 0) + Number(entry.amount || 0);

    return totals;
  }, {});

  const bestPlatform = Object.entries(platformTotals)
    .map(([platform, amount]) => ({
      platform,
      amount,
    }))
    .sort((a, b) => b.amount - a.amount)[0];

  const highestRevenueEntry =
    revenueEntries.length > 0
      ? revenueEntries.reduce((highest, current) =>
          Number(current.amount) > Number(highest.amount) ? current : highest
        )
      : null;

  const averageRevenue =
    revenueEntries.length > 0 ? totalRevenue / revenueEntries.length : 0;

  if (loading) {
    return <p className="text-zinc-400">Loading revenue...</p>;
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Creator Revenue
            </p>

            <h2 className="text-3xl font-bold">Revenue</h2>

            <p className="mt-2 max-w-2xl text-zinc-400">
              Manage revenue entries for {creator?.display_name}. Track income
              from platforms, products, sponsorships, donations, and more.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/revenue"
              className="rounded-xl border border-zinc-700 px-5 py-3 text-center font-semibold text-zinc-300 hover:bg-zinc-800"
            >
              Full Dashboard
            </Link>

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
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Total Revenue</p>
          <p className="mt-2 text-3xl font-bold">
            {formatCurrency(totalRevenue)}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">This Month</p>
          <p className="mt-2 text-3xl font-bold">
            {formatCurrency(thisMonthRevenue)}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Best Platform</p>
          <p className="mt-2 line-clamp-1 text-3xl font-bold">
            {bestPlatform?.platform || "—"}
          </p>

          {bestPlatform && (
            <p className="mt-1 text-xs text-zinc-500">
              {formatCurrency(bestPlatform.amount)}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Entries</p>
          <p className="mt-2 text-3xl font-bold">{revenueEntries.length}</p>

          <p className="mt-1 text-xs text-zinc-500">
            Avg: {formatCurrency(averageRevenue)}
          </p>
        </div>
      </section>

      {highestRevenueEntry && (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Highest Entry
              </p>

              <h3 className="mt-2 text-2xl font-bold">
                {highestRevenueEntry.platform}
              </h3>

              <p className="mt-1 text-sm text-zinc-400">
                {highestRevenueEntry.revenue_type} ·{" "}
                {formatMonth(highestRevenueEntry.entry_month)}
              </p>
            </div>

            <p className="text-3xl font-bold">
              {formatCurrency(highestRevenueEntry.amount)}
            </p>
          </div>
        </section>
      )}

      {revenueEntries.length === 0 ? (
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <h3 className="text-2xl font-bold">No revenue entries yet</h3>

          <p className="mx-auto mt-2 max-w-xl text-zinc-400">
            Start tracking income from platforms, products, sponsorships,
            donations, and other creator revenue streams.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/add-revenue"
              className="rounded-2xl bg-white px-6 py-3 font-semibold text-black hover:bg-zinc-200"
            >
              Add First Entry
            </Link>

            <Link
              href="/import-revenue"
              className="rounded-2xl border border-zinc-700 px-6 py-3 font-semibold hover:bg-zinc-800"
            >
              Import CSV
            </Link>
          </div>
        </section>
      ) : (
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-2xl font-bold">Revenue Entries</h3>

              <p className="mt-1 text-sm text-zinc-500">
                Recent records from your creator income streams.
              </p>
            </div>

            <p className="text-sm text-zinc-500">
              Showing {revenueEntries.length} entr
              {revenueEntries.length === 1 ? "y" : "ies"}
            </p>
          </div>

          <div className="space-y-3">
            {revenueEntries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{entry.platform}</h3>

                    <p className="mt-1 text-sm text-zinc-400">
                      {entry.revenue_type} · {formatMonth(entry.entry_month)}
                    </p>

                    {entry.notes && (
                      <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-500">
                        {entry.notes}
                      </p>
                    )}
                  </div>

                  <div className="sm:text-right">
                    <p className="text-2xl font-bold">
                      {formatCurrency(entry.amount)}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2 sm:justify-end">
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
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}