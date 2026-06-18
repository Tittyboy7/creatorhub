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
  PieChart,
  Pie,
  Cell,
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
  const [chartType, setChartType] = useState("area");

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
    const platform = entry.platform || "Other";
    totals[platform] = (totals[platform] || 0) + Number(entry.amount || 0);
    return totals;
  }, {});

  const revenueTypeTotals = filteredEntries.reduce((totals, entry) => {
    const type = entry.revenue_type || "Other";
    totals[type] = (totals[type] || 0) + Number(entry.amount || 0);
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

  const recentMonthlyChartData = monthlyChartData.slice(-12);

  const platformChartData = Object.entries(platformTotals)
    .map(([platform, amount]) => ({
      platform,
      revenue: Number(amount.toFixed(2)),
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const revenueTypeChartData = Object.entries(revenueTypeTotals)
    .map(([type, amount]) => ({
      type,
      revenue: Number(amount.toFixed(2)),
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const chartColors = [
    "#3b82f6",
    "#22c55e",
    "#f59e0b",
    "#ec4899",
    "#8b5cf6",
    "#06b6d4",
    "#f97316",
    "#ef4444",
  ];

  const bestPlatform = platformChartData[0];

  const averageMonthlyRevenue =
    monthlyChartData.length === 0
      ? 0
      : totalRevenue / monthlyChartData.length;

  const previousMonthRevenue =
    recentMonthlyChartData.length < 2
      ? 0
      : recentMonthlyChartData[recentMonthlyChartData.length - 2].revenue;

  const latestMonthRevenue =
    recentMonthlyChartData.length === 0
      ? 0
      : recentMonthlyChartData[recentMonthlyChartData.length - 1].revenue;

  const monthlyGrowthPercent =
    previousMonthRevenue === 0
      ? latestMonthRevenue > 0
        ? 100
        : 0
      : Math.round(
          ((latestMonthRevenue - previousMonthRevenue) / previousMonthRevenue) *
            100
        );

  const projectedNextMonthRevenue =
    latestMonthRevenue * (1 + monthlyGrowthPercent / 100);

  const projectedAnnualRevenue = averageMonthlyRevenue * 12;

  const hasActiveFilters =
    selectedPlatform !== "All" || selectedRevenueType !== "All";

  const topPlatformPercent =
    totalRevenue === 0 || !bestPlatform
      ? 0
      : Math.round((bestPlatform.revenue / totalRevenue) * 100);

  const bestMonth = monthlyChartData.reduce(
    (best, month) => (month.revenue > best.revenue ? month : best),
    { month: "", revenue: 0 }
  );

  const revenueStreak = [...monthlyChartData]
    .reverse()
    .reduce((streak, month) => {
      if (streak.stopped) return streak;
      if (month.revenue > 0) {
        return { count: streak.count + 1, stopped: false };
      }
      return { count: streak.count, stopped: true };
    }, { count: 0, stopped: false }).count;

  const businessInsights = [
    {
      title: "Revenue Concentration",
      value:
        topPlatformPercent >= 70
          ? "High Dependency"
          : topPlatformPercent >= 40
          ? "Moderate Dependency"
          : "Healthy Mix",
      description: bestPlatform
        ? `${topPlatformPercent}% of your revenue comes from ${bestPlatform.platform}. ${
            topPlatformPercent >= 70
              ? "Consider building additional revenue streams to reduce risk."
              : "Your platform mix is moving in a healthy direction."
          }`
        : "Add revenue entries to see platform dependency insights.",
    },
    {
      title: "Growth Momentum",
      value:
        monthlyGrowthPercent > 0
          ? `+${monthlyGrowthPercent}%`
          : `${monthlyGrowthPercent}%`,
      description:
        monthlyGrowthPercent > 0
          ? "Revenue increased compared to your previous tracked month."
          : monthlyGrowthPercent < 0
          ? "Revenue decreased compared to your previous tracked month."
          : "Revenue is currently flat compared to your previous tracked month.",
    },
    {
      title: "Revenue Streak",
      value: `${revenueStreak} month${revenueStreak === 1 ? "" : "s"}`,
      description:
        revenueStreak >= 3
          ? "You are building consistent revenue momentum."
          : "Keep adding monthly revenue to build a stronger tracking streak.",
    },
    {
      title: "Best Month",
      value: bestMonth.month ? formatMonth(bestMonth.month) : "—",
      description: bestMonth.month
        ? `${formatCurrency(bestMonth.revenue)} was your strongest tracked month.`
        : "Your best month will appear once revenue is added.",
    },
  ];  

  const revenueGoal = 10000;
  const goalProgressPercent =
    revenueGoal === 0
      ? 0
      : Math.min(Math.round((totalRevenue / revenueGoal) * 100), 100);

  const revenueGoalRemaining = Math.max(revenueGoal - totalRevenue, 0);

  const entriesByMonth = filteredEntries.reduce((groups, entry) => {
    const month = entry.entry_month || "Unknown";

    if (!groups[month]) {
      groups[month] = [];
    }

    groups[month].push(entry);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-5 py-8 text-white md:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <Link
          href="/dashboard"
          className="inline-block rounded-2xl border border-zinc-700 px-5 py-3 hover:bg-zinc-800"
        >
          Back to Dashboard
        </Link>

        <section className="rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Creator Business
              </p>

              <h1 className="mt-2 text-4xl font-bold md:text-5xl">
                Revenue Dashboard
              </h1>

              <p className="mt-4 max-w-3xl text-zinc-400">
                Track, compare, and manage revenue across creator platforms,
                products, subscriptions, donations, sponsorships, and income
                streams.
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
            <p className="text-sm text-zinc-400">Monthly Growth</p>

            <p
              className={`mt-2 text-3xl font-bold ${
                monthlyGrowthPercent >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {monthlyGrowthPercent >= 0 ? "+" : ""}
              {monthlyGrowthPercent}%
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              Latest month vs previous month
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

          <p className="mt-4 text-sm text-zinc-500">
            Showing {filteredEntries.length} of {entries.length} revenue entr
            {entries.length === 1 ? "y" : "ies"}
            {hasActiveFilters ? " with active filters" : ""}
          </p>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 md:p-6">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold md:text-3xl">
                  Monthly Revenue
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Last 12 months of tracked revenue.
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

            {recentMonthlyChartData.length === 0 ? (
              <p className="text-zinc-400">No chart data yet.</p>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height={300}>
                  {chartType === "bar" && (
                    <BarChart data={recentMonthlyChartData}>
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
                    <LineChart data={recentMonthlyChartData}>
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
                    <AreaChart data={recentMonthlyChartData}>
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

          <div className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-5 md:p-6">
            <h2 className="text-2xl font-bold md:text-3xl">
              Revenue Forecast
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Estimated performance from current tracked revenue.
            </p>

            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-sm text-zinc-500">Monthly Average</p>
                <p className="mt-1 text-xl font-bold">
                  {formatCurrency(averageMonthlyRevenue)}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-sm text-zinc-500">Projected Annual</p>
                <p className="mt-1 text-xl font-bold">
                  {formatCurrency(projectedAnnualRevenue)}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-sm text-zinc-500">Projected Next Month</p>
                <p className="mt-1 text-xl font-bold">
                  {formatCurrency(projectedNextMonthRevenue)}
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs text-zinc-500">
              Forecasts are estimates and may change as more revenue data is
              added.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 md:p-6">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Business Intelligence
            </p>

            <h2 className="mt-2 text-2xl font-bold md:text-3xl">
              Revenue Insights
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Smart observations based on your tracked creator income.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {businessInsights.map((insight) => (
              <div
                key={insight.title}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
              >
                <p className="text-sm text-zinc-500">{insight.title}</p>

                <p className="mt-2 text-2xl font-bold">{insight.value}</p>

                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  {insight.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-5 md:p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Revenue Goal
              </p>

              <h2 className="mt-2 text-2xl font-bold md:text-3xl">
                Creator Revenue Goal
              </h2>

              <p className="mt-2 text-zinc-400">
                {formatCurrency(totalRevenue)} tracked toward your{" "}
                {formatCurrency(revenueGoal)} goal.
              </p>
            </div>

            <div className="text-left lg:text-right">
              <p className="text-4xl font-bold">{goalProgressPercent}%</p>
              <p className="mt-1 text-sm text-zinc-500">
                {formatCurrency(revenueGoalRemaining)} remaining
              </p>
            </div>
          </div>

          <div className="mt-6 h-4 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-white"
              style={{ width: `${goalProgressPercent}%` }}
            />
          </div>
        </section>

        <section
          className={`rounded-3xl border p-5 md:p-6 ${
            topPlatformPercent >= 80
              ? "border-red-900 bg-red-950/20"
              : topPlatformPercent >= 60
              ? "border-yellow-900 bg-yellow-950/20"
              : "border-zinc-800 bg-zinc-900"
          }`}
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Dependency Risk
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            {topPlatformPercent >= 80
              ? "High Platform Risk"
              : topPlatformPercent >= 60
              ? "Moderate Platform Risk"
              : "Healthy Revenue Spread"}
          </h2>

          <p className="mt-3 max-w-3xl text-zinc-400">
            {bestPlatform
              ? `${topPlatformPercent}% of your tracked revenue comes from ${bestPlatform.platform}.`
              : "Add revenue entries to calculate platform risk."}
          </p>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 md:p-6">
            <div className="mb-5">
              <h2 className="text-2xl font-bold md:text-3xl">Revenue Share</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Compare revenue by platform.
              </p>
            </div>

            {platformChartData.length === 0 ? (
              <p className="mt-6 text-zinc-400">No chart data yet.</p>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={platformChartData}
                        dataKey="revenue"
                        nameKey="platform"
                        innerRadius={70}
                        outerRadius={105}
                        paddingAngle={3}
                      >
                        {platformChartData.map((entry, index) => (
                          <Cell
                            key={entry.platform}
                            fill={chartColors[index % chartColors.length]}
                          />
                        ))}
                      </Pie>

                      <Tooltip
                        formatter={(value) => [formatCurrency(value), "Revenue"]}
                        contentStyle={{
                          backgroundColor: "#18181b",
                          border: "1px solid #3f3f46",
                          borderRadius: "16px",
                          color: "#ffffff",
                        }}
                        labelStyle={{ color: "#ffffff" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                  {platformChartData.map((item, index) => {
                    const percent =
                      totalRevenue === 0
                        ? 0
                        : Math.round((item.revenue / totalRevenue) * 100);

                    return (
                      <div
                        key={item.platform}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{
                              backgroundColor:
                                chartColors[index % chartColors.length],
                            }}
                          />

                          <div>
                            <p className="font-semibold">{item.platform}</p>
                            <p className="text-xs text-zinc-500">
                              {percent}% of revenue
                            </p>
                          </div>
                        </div>

                        <p className="font-semibold text-zinc-300">
                          {formatCurrency(item.revenue)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 md:p-6">
            <div className="mb-5">
              <h2 className="text-2xl font-bold md:text-3xl">
                Revenue Type Breakdown
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Compare revenue by category.
              </p>
            </div>

            {revenueTypeChartData.length === 0 ? (
              <p className="mt-6 text-zinc-400">
                No revenue type data yet.
              </p>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={revenueTypeChartData}
                        dataKey="revenue"
                        nameKey="type"
                        innerRadius={70}
                        outerRadius={105}
                        paddingAngle={3}
                      >
                        {revenueTypeChartData.map((entry, index) => (
                          <Cell
                            key={entry.type}
                            fill={chartColors[index % chartColors.length]}
                          />
                        ))}
                      </Pie>

                      <Tooltip
                        formatter={(value) => [formatCurrency(value), "Revenue"]}
                        contentStyle={{
                          backgroundColor: "#18181b",
                          border: "1px solid #3f3f46",
                          borderRadius: "16px",
                          color: "#ffffff",
                        }}
                        labelStyle={{ color: "#ffffff" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                  {revenueTypeChartData.map((item, index) => {
                    const percent =
                      totalRevenue === 0
                        ? 0
                        : Math.round((item.revenue / totalRevenue) * 100);

                    return (
                      <div
                        key={item.type}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{
                              backgroundColor:
                                chartColors[index % chartColors.length],
                            }}
                          />

                          <div>
                            <p className="font-semibold">{item.type}</p>
                            <p className="text-xs text-zinc-500">
                              {percent}% of revenue
                            </p>
                          </div>
                        </div>

                        <p className="font-semibold text-zinc-300">
                          {formatCurrency(item.revenue)}
                        </p>
                      </div>
                    );
                  })}
                </div>
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
                Add revenue manually or import a CSV to start tracking your
                creator business income.
              </p>

              <Link
                href="/add-revenue"
                className="mt-6 inline-block rounded-2xl bg-white px-6 py-3 font-semibold text-black hover:bg-zinc-200"
              >
                Add First Revenue Entry
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(entriesByMonth).map(([month, monthEntries]) => (
                <div key={month} className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl font-bold">
                      {month === "Unknown" ? "Unknown Month" : formatMonth(month)}
                    </h3>

                    <p className="text-sm text-zinc-500">
                      {formatCurrency(
                        monthEntries.reduce(
                          (sum, entry) => sum + Number(entry.amount || 0),
                          0
                        )
                      )}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {monthEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h4 className="text-lg font-semibold">{entry.platform}</h4>

                            <p className="mt-1 text-sm text-zinc-400">
                              {entry.revenue_type}
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
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}