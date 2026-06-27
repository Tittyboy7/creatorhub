"use client";

import ComparisonHero from "@/components/compare/ComparisonHero";
import ComparisonSidebar from "@/components/compare/ComparisonSidebar";
import ComparisonRevenueChart from "@/components/compare/ComparisonRevenueChart";
import ComparisonPlatformCards from "@/components/compare/ComparisonPlatformCards";
import ComparisonInsights from "@/components/compare/ComparisonInsights";
import ComparisonRevenueMix from "@/components/compare/ComparisonRevenueMix";
import ComparisonRevenueTrend from "@/components/compare/ComparisonRevenueTrend";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { buildBusinessMetrics } from "@/lib/business/buildBusinessMetrics";
import { buildPlatformComparisonMetrics } from "@/lib/business/buildPlatformComparisonMetrics";
import { businessTimePeriods } from "@/lib/business/businessTimePeriods";
import { businessSystems } from "@/lib/business/businessSystems";
import { buildBusinessComparisons } from "@/lib/business/buildBusinessComparisons";

function isMetricInTimePeriod(metric, selectedTimePeriod) {
  if (selectedTimePeriod === "all") return true;

  const metricDateValue = metric.period
    ? `${metric.period}-01`
    : metric.date;

  if (!metricDateValue) return true;

  const metricDate = new Date(metricDateValue);
  const now = new Date();

  const daysByPeriod = {
    today: 1,
    "7d": 7,
    "30d": 30,
    "90d": 90,
    "12m": 365,
  };

  const days = daysByPeriod[selectedTimePeriod];

  if (!days) return true;

  const cutoff = new Date();
  cutoff.setDate(now.getDate() - days);

  return metricDate >= cutoff;
}

  const defaultVisibleMetrics = [
    "revenue",
    "subscribers",
    "views",
    "orders",
    "average_order_value",
    "patrons",
    "gross_revenue",
    "net_revenue",
    "successful_payments",
    "customers",
  ];

  const comparisonChartColors = [
    "#3b82f6",
    "#22c55e",
    "#a855f7",
    "#f97316",
    "#ec4899",
    "#06b6d4",
    "#facc15",
    "#ef4444",
  ];

export default function ComparePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [revenueEntries, setRevenueEntries] = useState([]);
  const [products, setProducts] = useState([]);
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("all");
  const [selectedSystem, setSelectedSystem] = useState("all");
  const [selectedChartType, setSelectedChartType] = useState("bar");

  useEffect(() => {
    async function loadComparisonData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: creator } = await supabase
        .from("creators")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!creator) {
        router.push("/create-profile");
        return;
      }

      const { data: revenueData, error: revenueError } = await supabase
        .from("revenue_entries")
        .select("*")
        .eq("creator_id", creator.id)
        .order("entry_month", { ascending: false });

      if (revenueError) {
        alert(revenueError.message);
      }

      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("creator_id", creator.id);

      if (productError) {
        alert(productError.message);
      }

      const { data: connectedAccountsData, error: connectedAccountsError } =
        await supabase
          .from("connected_accounts")
          .select("*")
          .eq("user_id", user.id);

      if (connectedAccountsError) {
        alert(connectedAccountsError.message);
      }

      setRevenueEntries(revenueData || []);
      setProducts(productData || []);
      setConnectedAccounts(connectedAccountsData || []);
      setLoading(false);
    }

    loadComparisonData();
  }, [router]);

  const comparisonMetrics = useMemo(() => {
    const businessMetrics = buildBusinessMetrics({
      revenueEntries,
      connectedAccounts,
      products,
    });

    return buildPlatformComparisonMetrics({
      metrics: businessMetrics,
    });
  }, [revenueEntries, connectedAccounts, products]);

  const systemPlatformLookup = Object.fromEntries(
    businessSystems.flatMap((system) =>
      system.platforms.map((platform) => [platform, system.key])
    )
  );

  const filteredComparisonMetrics = comparisonMetrics.filter((metric) => {
    const matchesTime = isMetricInTimePeriod(metric, selectedTimePeriod);

    const matchesSystem =
      selectedSystem === "all" ||
      systemPlatformLookup[metric.platform] === selectedSystem;

    return matchesTime && matchesSystem;
  });

  const businessComparisons = buildBusinessComparisons({
    metrics: filteredComparisonMetrics,
    selectedSystem,
    selectedTimePeriod,
  }); 

  const platforms = [
    ...new Set(filteredComparisonMetrics.map((metric) => metric.platform)),
  ];

  const metricTypes = [
    ...new Set(filteredComparisonMetrics.map((metric) => metric.metric)),
  ];

  const metricsByPlatform = platforms.map((platform) => ({
    platform,
    metrics: filteredComparisonMetrics.filter(
      (metric) => metric.platform === platform
    ),
  }));

  const revenueComparisonData = metricsByPlatform
    .map((group) => ({
      platform: group.platform,
      revenue: group.metrics
        .filter((metric) => metric.metric === "revenue")
        .reduce((sum, metric) => sum + Number(metric.value || 0), 0),
    }))
    .filter((item) => item.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        Loading comparison workspace...
      </div>
    );
  }

  const revenueTrendData = Object.entries(
    filteredComparisonMetrics
      .filter((metric) => metric.metric === "revenue" && metric.period)
      .reduce((totals, metric) => {
        totals[metric.period] =
          (totals[metric.period] || 0) + Number(metric.value || 0);

        return totals;
      }, {})
  )
    .map(([period, revenue]) => ({
      period,
      revenue,
    }))
    .sort((a, b) => a.period.localeCompare(b.period));

  return (
    <div className="min-h-screen bg-zinc-950 px-5 py-6 text-white md:px-10 md:py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <ComparisonHero />

        <section className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <ComparisonSidebar
            platforms={platforms}
            metricTypes={metricTypes}
            selectedSystem={selectedSystem}
            setSelectedSystem={setSelectedSystem}
            selectedTimePeriod={selectedTimePeriod}
            setSelectedTimePeriod={setSelectedTimePeriod}
          />

          <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-2xl font-bold">Comparison Canvas</h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              This workspace is now connected to normalized business metrics. Charts and filters will be added next.
            </p>

            <ComparisonRevenueChart
              revenueComparisonData={revenueComparisonData}
              selectedChartType={selectedChartType}
              setSelectedChartType={setSelectedChartType}
            />

            <ComparisonInsights businessComparisons={businessComparisons} />

            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              <ComparisonRevenueMix revenueComparisonData={revenueComparisonData} />
              <ComparisonRevenueTrend revenueTrendData={revenueTrendData} />
            </div>

            {false && (
              <ComparisonPlatformCards
                comparisonMetrics={filteredComparisonMetrics}
                metricsByPlatform={metricsByPlatform}
              />
            )}
          </section>
        </section>
      </div>
    </div>
  );
}