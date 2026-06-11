"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatMonth } from "@/lib/formatMonth";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value || 0));
}

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export default function RevenuePage() {
  const router = useRouter();

  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [selectedRevenueType, setSelectedRevenueType] = useState("All");
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [chartType, setChartType] = useState("bar");

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

  const platforms = [
    "All",
    ...new Set(entries.map((entry) => entry.platform).filter(Boolean)),
  ];

  const revenueTypes = [
    "All",
    ...new Set(entries.map((entry) => entry.revenue_type).filter(Boolean)),
  ];

  const filteredEntries = entries
    .filter((entry) => {
      const platformMatches =
        selectedPlatform === "All" || entry.platform === selectedPlatform;

      const typeMatches =
        selectedRevenueType === "All" ||
        entry.revenue_type === selectedRevenueType;

      return platformMatches && typeMatches;
    })
    .sort((a, b) => b.entry_month.localeCompare(a.entry_month));

  const totalRevenue = filteredEntries.reduce(
    (sum, entry) => sum + Number(entry.amount || 0),
    0
  );

  const currentMonth = getCurrentMonth();

  const thisMonthRevenue = filteredEntries
    .filter((entry) => entry.entry_month === currentMonth)
    .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);

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

  const bestPlatform = platformChartData[0];

  const averageMonthlyRevenue =
    monthlyChartData.length === 0
      ? 0
      : totalRevenue / monthlyChartData.length;

  const hasActiveFilters =
    selectedPlatform !== "All" || selectedRevenueType !== "All";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-5 py-8 text-white md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <Link
          href="/dashboard"
          className="inline-block rounded-2xl border border-zinc-700 px-5 py-3 hover:bg-zinc-800"
        >
          Back to Dashboard
        </Link>

        <section className="rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6 shadow-2xl md:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Creator Business
              </p>

              <h1 className="text-4xl font-bold md:text-6xl">
                Revenue Dashboard
              </h1>

              <p className="mt-4 max-w-3xl text-lg text-zinc-400">
                Track, compare, and manage revenue across your creator platforms,
                products, subscriptions, donations, sponsorships, and income streams.
              </p>

              <p className="mt-3 text-sm text-zinc-500">
                Manual entries and CSV imports are supported now. Real-time platform
                syncing can be added later with connected platform APIs.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/add-revenue"
                className="rounded-2xl bg-white px-6 py-3 font-semibold text-black hover:bg-zinc-200"
              >
                Add Revenue
              </Link>

              <Link
                href="/import-revenue"
                className="rounded-2xl border border-zinc-700 px-6 py-3 font-semibold hover:bg-zinc-800"
              >
                Import CSV
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-400">Total Revenue</p>
            <p className="mt-2 text-3xl font-bold">
              {formatCurrency(totalRevenue)}
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-400">This Month</p>
            <p className="mt-2 text-3xl font-bold">
              {formatCurrency(thisMonthRevenue)}
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-400">Best Platform</p>
            <p className="mt-2 line-clamp-1 text-3xl font-bold">
              {bestPlatform?.platform || "—"}
            </p>
            {bestPlatform && (
              <p className="mt-1 text-sm text-zinc-500">
                {formatCurrency(bestPlatform.revenue)}
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-400">Entries</p>
            <p className="mt-2 text-3xl font-bold">{filteredEntries.length}</p>
            <p className="mt-1 text-sm text-zinc-500">
              Avg/month: {formatCurrency(averageMonthlyRevenue)}
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Filters
          </p>

          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <select
              className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 p-4"
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
              className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 p-4"
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
              className="rounded-2xl border border-zinc-700 px-5 py-3 font-semibold hover:bg-zinc-800"
            >
              Reset
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-500">
              Showing {filteredEntries.length} of {entries.length} revenue entr
              {entries.length === 1 ? "y" : "ies"}
            </p>

            {hasActiveFilters && (
              <p className="text-sm text-zinc-500">
                Filters active
                {selectedPlatform !== "All" ? ` · Platform: ${selectedPlatform}` : ""}
                {selectedRevenueType !== "All"
                  ? ` · Type: ${selectedRevenueType}`
                  : ""}
              </p>
            )}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 md:p-6">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold md:text-3xl">
                  Monthly Revenue
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Track revenue trends over time.
                </p>
              </div>

              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="rounded-2xl border border-zinc-700 bg-zinc-800 px-4 py-3"
              >
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="area">Area Chart</option>
              </select>
            </div>

            {monthlyChartData.length === 0 ? (
              <p className="text-zinc-400">No chart data yet.</p>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height={300}>
                  {chartType === "bar" && (
                    <BarChart data={monthlyChartData}>
                      <XAxis
                        dataKey="month"
                        stroke="#a1a1aa"
                        tickFormatter={(month) => formatMonth(month)}
                      />
                      <YAxis stroke="#a1a1aa" />
                      <Tooltip
                        formatter={(value) => [
                          formatCurrency(value),
                          "Revenue",
                        ]}
                        contentStyle={{
                          backgroundColor: "#18181b",
                          border: "1px solid #3f3f46",
                          borderRadius: "16px",
                          color: "#ffffff",
                        }}
                        labelStyle={{ color: "#ffffff" }}
                      />
                      <Bar
                        dataKey="revenue"
                        fill="#ffffff"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  )}

                  {chartType === "line" && (
                    <LineChart data={monthlyChartData}>
                      <XAxis
                        dataKey="month"
                        stroke="#a1a1aa"
                        tickFormatter={(month) => formatMonth(month)}
                      />
                      <YAxis stroke="#a1a1aa" />
                      <Tooltip
                        formatter={(value) => [
                          formatCurrency(value),
                          "Revenue",
                        ]}
                        contentStyle={{
                          backgroundColor: "#18181b",
                          border: "1px solid #3f3f46",
                          borderRadius: "16px",
                          color: "#ffffff",
                        }}
                        labelStyle={{ color: "#ffffff" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#ffffff"
                        strokeWidth={3}
                      />
                    </LineChart>
                  )}

                  {chartType === "area" && (
                    <AreaChart data={monthlyChartData}>
                      <XAxis
                        dataKey="month"
                        stroke="#a1a1aa"
                        tickFormatter={(month) => formatMonth(month)}
                      />
                      <YAxis stroke="#a1a1aa" />
                      <Tooltip
                        formatter={(value) => [
                          formatCurrency(value),
                          "Revenue",
                        ]}
                        contentStyle={{
                          backgroundColor: "#18181b",
                          border: "1px solid #3f3f46",
                          borderRadius: "16px",
                          color: "#ffffff",
                        }}
                        labelStyle={{ color: "#ffffff" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#ffffff"
                        fill="#ffffff"
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 md:p-6">
            <h2 className="text-2xl font-bold md:text-3xl">
              Platform Breakdown
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Compare revenue by source.
            </p>

            {platformChartData.length === 0 ? (
              <p className="mt-6 text-zinc-400">No platform data yet.</p>
            ) : (
              <div className="mt-6 space-y-3">
                {platformChartData.map((item) => {
                  const percent =
                    totalRevenue === 0
                      ? 0
                      : Math.round((item.revenue / totalRevenue) * 100);

                  return (
                    <div
                      key={item.platform}
                      className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-semibold">{item.platform}</p>
                        <p className="font-semibold text-zinc-300">
                          {formatCurrency(item.revenue)}
                        </p>
                      </div>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-white"
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      <p className="mt-2 text-xs text-zinc-500">
                        {percent}% of filtered revenue
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 md:p-6">
            <h2 className="text-2xl font-bold md:text-3xl">
              Monthly Breakdown
            </h2>

            {Object.keys(monthlyTotals).length === 0 ? (
              <p className="mt-6 text-zinc-400">No monthly data yet.</p>
            ) : (
              <div className="mt-6 space-y-3">
                {Object.entries(monthlyTotals)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([month, amount]) => (
                    <div
                      key={month}
                      className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
                    >
                      <span className="font-semibold">{formatMonth(month)}</span>
                      <span className="text-zinc-300">
                        {formatCurrency(amount)}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 md:p-6">
            <h2 className="text-2xl font-bold md:text-3xl">
              Platform Chart
            </h2>

            {platformChartData.length === 0 ? (
              <p className="mt-6 text-zinc-400">No chart data yet.</p>
            ) : (
              <div className="mt-6 h-80">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={platformChartData}>
                    <XAxis dataKey="platform" stroke="#a1a1aa" />
                    <YAxis stroke="#a1a1aa" />
                    <Tooltip
                      formatter={(value) => [
                        formatCurrency(value),
                        "Revenue",
                      ]}
                      contentStyle={{
                        backgroundColor: "#18181b",
                        border: "1px solid #3f3f46",
                        borderRadius: "16px",
                        color: "#ffffff",
                      }}
                      labelStyle={{ color: "#ffffff" }}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="#ffffff"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 md:p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">
                Revenue Entries
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Manage individual revenue records.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/add-revenue"
                className="rounded-2xl bg-white px-5 py-3 font-semibold text-black hover:bg-zinc-200"
              >
                Add Revenue
              </Link>

              <Link
                href="/import-revenue"
                className="rounded-2xl border border-zinc-700 px-5 py-3 font-semibold hover:bg-zinc-800"
              >
                Import CSV
              </Link>
            </div>
          </div>

          {filteredEntries.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center">
              <h3 className="text-xl font-bold">No revenue entries found</h3>

              <p className="mx-auto mt-2 max-w-xl text-zinc-400">
                Add revenue manually or import a CSV to start tracking your creator
                business income.
              </p>

              <Link
                href="/add-revenue"
                className="mt-6 inline-block rounded-2xl bg-white px-6 py-3 font-semibold text-black hover:bg-zinc-200"
              >
                Add First Revenue Entry
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">
                        {entry.platform}
                      </h3>

                      <p className="mt-1 text-sm text-zinc-400">
                        {entry.revenue_type} · {formatMonth(entry.entry_month)}
                      </p>

                      {entry.notes && (
                        <p className="mt-3 text-sm text-zinc-500">
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
                          onClick={() => handleDeleteEntry(entry.id)}
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
          )}
        </section>
      </div>
    </div>
  );
}