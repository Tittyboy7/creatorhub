"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function RevenuePage() {
  const router = useRouter();

  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [selectedRevenueType, setSelectedRevenueType] = useState("All");
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    async function loadRevenue() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("revenue_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("entry_month", { ascending: false });

      if (error) {
        alert(error.message);
      } else {
        setEntries(data || []);
      }

      setLoading(false);
    }

    loadRevenue();
  }, [router]);

  async function handleDeleteEntry(entryId) {
    const confirmed = confirm(
      "Are you sure you want to delete this revenue entry?"
    );

    if (!confirmed) {
      return;
    }

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

  const platforms = [
    "All",
    ...new Set(entries.map((entry) => entry.platform)),
  ];

  const revenueTypes = [
    "All",
    ...new Set(entries.map((entry) => entry.revenue_type)),
  ];

  const filteredEntries = entries.filter((entry) => {
    const platformMatches =
      selectedPlatform === "All" ||
      entry.platform === selectedPlatform;

    const typeMatches =
      selectedRevenueType === "All" ||
      entry.revenue_type === selectedRevenueType;

    return platformMatches && typeMatches;
  });

  const totalRevenue = filteredEntries.reduce(
    (sum, entry) => sum + Number(entry.amount || 0),
    0
  );

  const platformTotals = filteredEntries.reduce((totals, entry) => {
    totals[entry.platform] =
      (totals[entry.platform] || 0) + Number(entry.amount || 0);

    return totals;
  }, {});

  const monthlyTotals = filteredEntries.reduce((totals, entry) => {
    totals[entry.entry_month] =
      (totals[entry.entry_month] || 0) + Number(entry.amount || 0);

    return totals;
  }, {});

  const monthlyChartData = Object.entries(monthlyTotals)
    .map(([month, amount]) => ({
      month,
      revenue: Number(amount.toFixed(2)),
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const platformChartData = Object.entries(platformTotals)
    .map(([platform, amount]) => ({
      platform,
      revenue: Number(amount.toFixed(2)),
    }))
    .sort((a, b) => b.revenue - a.revenue);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-10">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/dashboard"
          className="inline-block mb-8 border border-zinc-700 px-5 py-3 rounded-2xl hover:bg-zinc-800"
        >
          Back to Dashboard
        </Link>

        <h1 className="text-5xl font-bold mb-4">Revenue</h1>

        <p className="text-zinc-400 text-lg mb-8">
          Track revenue across platforms, products, donations, subs, and more.
        </p>

        <select
          className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4 mb-8"
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(e.target.value)}
        >
          {platforms.map((platform) => (
            <option key={platform} value={platform}>
              {platform}
            </option>
          ))}
        </select>

        <select
          className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4 mb-8"
          value={selectedRevenueType}
          onChange={(e) => setSelectedRevenueType(e.target.value)}
        >
          {revenueTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setSelectedPlatform("All");
            setSelectedRevenueType("All");
          }}
          className="mb-10 border border-zinc-700 px-5 py-3 rounded-2xl hover:bg-zinc-800"
        >
          Reset Filters
        </button>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <p className="text-zinc-400">Total Revenue</p>
            <p className="text-4xl font-bold mt-2">
              ${totalRevenue.toFixed(2)}
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <p className="text-zinc-400">Entries</p>
            <p className="text-4xl font-bold mt-2">
              {entries.length}
            </p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-10">
          <h2 className="text-3xl font-bold mb-6">
            Platform Breakdown
          </h2>

          {Object.keys(platformTotals).length === 0 ? (
            <p className="text-zinc-400">No revenue data yet.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(platformTotals).map(([platform, amount]) => (
                <div
                  key={platform}
                  className="flex items-center justify-between border border-zinc-800 rounded-2xl p-4"
                >
                  <span className="font-semibold">{platform}</span>
                  <span className="text-zinc-300">
                    ${amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-10">
          <h2 className="text-3xl font-bold mb-6">
            Monthly Revenue Chart
          </h2>

          {monthlyChartData.length === 0 ? (
            <p className="text-zinc-400">No chart data yet.</p>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyChartData}>
                  <XAxis dataKey="month" stroke="#a1a1aa" />
                  <YAxis stroke="#a1a1aa" />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#ffffff" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-10">
          <h2 className="text-3xl font-bold mb-6">
            Monthly Breakdown
          </h2>

          {Object.keys(monthlyTotals).length === 0 ? (
            <p className="text-zinc-400">No monthly data yet.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(monthlyTotals).map(([month, amount]) => (
                <div
                  key={month}
                  className="flex items-center justify-between border border-zinc-800 rounded-2xl p-4"
                >
                  <span className="font-semibold">{month}</span>
                  <span className="text-zinc-300">
                    ${amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-10">
          <h2 className="text-3xl font-bold mb-6">
            Platform Revenue Chart
          </h2>

          {platformChartData.length === 0 ? (
            <p className="text-zinc-400">No chart data yet.</p>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={platformChartData}>
                  <XAxis dataKey="platform" stroke="#a1a1aa" />
                  <YAxis stroke="#a1a1aa" />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#ffffff" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-3xl font-bold">Revenue Entries</h2>

            <Link
              href="/add-revenue"
              className="bg-white text-black px-5 py-3 rounded-2xl font-semibold"
            >
              Add Revenue
            </Link>
          </div>

          {filteredEntries.length === 0 ? (
            <p className="text-zinc-400">No revenue entries yet.</p>
          ) : (
            <div className="space-y-4">
              {filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-semibold">
                        {entry.platform}
                      </h3>

                      <p className="text-zinc-400 mt-1">
                        {entry.revenue_type} · {entry.entry_month}
                      </p>
                    </div>

                    <p className="text-3xl font-bold">
                      ${Number(entry.amount || 0).toFixed(2)}
                    </p>
                  </div>

                  {entry.notes && (
                    <p className="text-zinc-400 mt-4">
                      {entry.notes}
                    </p>
                  )}

                  <div className="mt-4">
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        href={`/edit-revenue/${entry.id}`}
                        className="bg-white text-black px-5 py-3 rounded-2xl font-semibold"
                      >
                        Edit Entry
                      </Link>

                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="border border-red-900 text-red-400 px-5 py-3 rounded-2xl hover:bg-red-950"
                      >
                        Delete Entry
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}