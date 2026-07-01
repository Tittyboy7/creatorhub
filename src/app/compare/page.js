"use client";

import ComparisonHero from "@/components/compare/ComparisonHero";
import ComparisonSidebar from "@/components/compare/ComparisonSidebar";
import AddChartModal from "@/components/compare/AddChartModal";
import SavedCompareChart from "@/components/compare/SavedCompareChart";
import { buildSavedCompareChartData } from "@/lib/business/buildSavedCompareChartData";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { buildBusinessMetrics } from "@/lib/business/buildBusinessMetrics";
import { buildPlatformComparisonMetrics } from "@/lib/business/buildPlatformComparisonMetrics";
import { businessTimePeriods } from "@/lib/business/businessTimePeriods";
import { businessSystems } from "@/lib/business/businessSystems";
import { buildBusinessComparisons } from "@/lib/business/buildBusinessComparisons";
import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";

import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

import SortableCompareWidget from "@/components/compare/SortableCompareWidget";
import {
  formatCompareChartTitle,
  formatCompareChartSubtitle,
} from "@/lib/compare/formatCompareChartTitle";

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
  const [savedCharts, setSavedCharts] = useState([]);
  const [showAddChartModal, setShowAddChartModal] = useState(false);
  const [editingChart, setEditingChart] = useState(null);
  const [syncingPlatforms, setSyncingPlatforms] = useState(false);
  const [syncResults, setSyncResults] = useState([]);

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

      const { data: savedChartsData, error: savedChartsError } =
        await supabase
          .from("compare_charts")
          .select("*")
          .eq("user_id", user.id)
          .order("position", { ascending: true });

      if (savedChartsError) {
        alert(savedChartsError.message);
      }

      setRevenueEntries(revenueData || []);
      setProducts(productData || []);
      setConnectedAccounts(connectedAccountsData || []);
      setSavedCharts(savedChartsData || []);
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

  async function handleDragEnd(event) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = savedCharts.findIndex((chart) => chart.id === active.id);
    const newIndex = savedCharts.findIndex((chart) => chart.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedCharts = arrayMove(savedCharts, oldIndex, newIndex).map(
      (chart, index) => ({
        ...chart,
        position: index,
      })
    );

    setSavedCharts(reorderedCharts);

    for (const chart of reorderedCharts) {
      const { error } = await supabase
        .from("compare_charts")
          .update({
          position: chart.position,
          updated_at: new Date().toISOString(),
        })
        .eq("id", chart.id);

      if (error) {
        alert(error.message);
        return;
      }
    }
  }

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
      <div className="mx-auto max-w-[92rem] space-y-6">
        <ComparisonHero />

        <section className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <ComparisonSidebar
            platforms={platforms}
            metricTypes={metricTypes}
            selectedSystem={selectedSystem}
            setSelectedSystem={setSelectedSystem}
            selectedTimePeriod={selectedTimePeriod}
            setSelectedTimePeriod={setSelectedTimePeriod}
            onAddChart={() => {
              setEditingChart(null);
              setShowAddChartModal(true);
            }}
            syncingPlatforms={syncingPlatforms}
            syncResults={syncResults}
            onSyncAll={async () => {
              setSyncingPlatforms(true);
              setSyncResults([]);

              try {
                const {
                  data: { user },
                } = await supabase.auth.getUser();

                if (!user) return;

                const syncablePlatforms = connectedAccounts
                  .map((account) => account.platform)
                  .filter((platform) =>
                    ["youtube", "twitch", "kick", "shopify", "patreon", "stripe", "paypal"].includes(platform)
                  );

                const results = [];

                for (const platform of syncablePlatforms) {
                  try {
                    const response = await fetch(`/api/sync/${platform}?user_id=${user.id}`);
                    const data = await response.json();

                    results.push({
                      platform,
                      success: response.ok,
                      message: response.ok
                        ? data.message || "Sync completed."
                        : data.error || "Sync failed.",
                    });
                  } catch (error) {
                    results.push({
                      platform,
                      success: false,
                      message: error.message || "Sync failed.",
                    });
                  }
                }

                setSyncResults(results);
              } finally {
                setSyncingPlatforms(false);
              }
            }}
          />

          <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-2xl font-bold">Comparison Canvas</h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              This workspace is now connected to normalized business metrics. Charts and filters will be added next.
            </p>

            {savedCharts.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-zinc-700 bg-zinc-950 p-10 text-center">
                <h3 className="text-xl font-bold">Build your comparison workspace</h3>

                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-400">
                  Add charts to compare revenue, views, customers, orders, and other creator
                  business metrics.
                </p>

                <button
                  type="button"
                  onClick={() => setShowAddChartModal(true)}
                  className="mt-6 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-zinc-200"
                >
                  + Create your first chart
                </button>
              </div>
            ) : (
              <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext
                  items={savedCharts.map((chart) => chart.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="mb-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {savedCharts.map((chart) => (
                      <SortableCompareWidget
                        key={chart.id}
                        id={chart.id}
                        title={formatCompareChartTitle(chart)}
                        subtitle={formatCompareChartSubtitle(chart)}
                        size={chart.width || 1}
                        onResize={async (chartId, width) => {
                          const { error } = await supabase
                            .from("compare_charts")
                            .update({
                              width,
                              updated_at: new Date().toISOString(),
                              })
                            .eq("id", chartId);

                          if (error) {
                            alert(error.message);
                            return;
                          }

                          setSavedCharts((current) =>
                            current.map((savedChart) =>
                              savedChart.id === chartId ? { ...savedChart, width } : savedChart
                            )
                          );
                        }}
                      >
                  <SavedCompareChart
                    key={chart.id}
                    chart={chart}
                    metrics={comparisonMetrics}
                    data={buildSavedCompareChartData({
                      chart,
                      metrics: comparisonMetrics,
                    })}

                    onEdit={(chart) => {
                      setEditingChart(chart);
                      setShowAddChartModal(true);
                    }}

                    onDelete={async (chartId) => {
                      const confirmed = window.confirm("Remove this chart from your workspace?");

                      if (!confirmed) return;

                      const { error } = await supabase
                        .from("compare_charts")
                        .delete()
                        .eq("id", chartId);

                      if (error) {
                        alert(error.message);
                        return;
                      }

                      setSavedCharts((current) =>
                        current.filter((savedChart) => savedChart.id !== chartId)
                      );
                    }}
                    onResize={async (chartId, size) => {
                      const { error } = await supabase
                        .from("compare_charts")
                        .update({
                          size,
                          updated_at: new Date().toISOString(),
                        })
                        .eq("id", chartId);

                      if (error) {
                        alert(error.message);
                        return;
                      }

                      setSavedCharts((current) =>
                        current.map((savedChart) =>
                          savedChart.id === chartId ? { ...savedChart, size } : savedChart
                        )
                      );
                    }}

                    onMoveUp={(chartId) => {
                      setSavedCharts((current) => {
                        const index = current.findIndex((chart) => chart.id === chartId);

                        if (index <= 0) return current;

                        const updated = [...current];
                        [updated[index - 1], updated[index]] = [
                          updated[index],
                          updated[index - 1],
                        ];

                        return updated;
                      });
                    }}

                    onMoveDown={(chartId) => {
                      setSavedCharts((current) => {
                        const index = current.findIndex((chart) => chart.id === chartId);

                        if (index === -1 || index >= current.length - 1) return current;

                        const updated = [...current];
                        [updated[index], updated[index + 1]] = [
                          updated[index + 1],
                          updated[index],
                        ];

                        return updated;
                      });
                    }}
                        />
                      </SortableCompareWidget>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

        {false && (
          <>
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
          </>
        )}

            {false && (
              <ComparisonPlatformCards
                comparisonMetrics={filteredComparisonMetrics}
                metricsByPlatform={metricsByPlatform}
              />
            )}
          </section>
        </section>
      </div>
      {showAddChartModal && (
        <AddChartModal
          editingChart={editingChart}
          onClose={() => {
            setEditingChart(null);
            setShowAddChartModal(false);
          }}
          onAddChart={async (chart) => {
            const {
              data: { user },
            } = await supabase.auth.getUser();

            if (!user) return;

            const chartPayload = {
              title: formatCompareChartTitle({
              metric: chart.metric,
              compare_by: chart.compareBy,
            }),
              metric: chart.metric,
              compare_by: chart.compareBy,
              chart_type: chart.chartType,
              time_period: chart.timePeriod,
              config: {
                dataset: chart.metric,
                compareBy: chart.compareBy,
                visualization: chart.chartType,
                timePeriod: chart.timePeriod,
              },
              updated_at: new Date().toISOString(),
            };

            if (editingChart) {
              const { data, error } = await supabase
                .from("compare_charts")
                .update(chartPayload)
                .eq("id", editingChart.id)
                .select()
                .single();

              if (error) {
                alert(error.message);
                return;
              }

              setSavedCharts((current) =>
                current.map((savedChart) =>
                  savedChart.id === editingChart.id ? data : savedChart
                )
              );

              setEditingChart(null);
              setShowAddChartModal(false);
              return;
            }

            const { data, error } = await supabase
              .from("compare_charts")
              .insert({
                user_id: user.id,
                ...chartPayload,
                position: savedCharts.length,
                  size: "medium",
                  width: 2,
                  height: 1,
              })
              .select()
              .single();

            if (error) {
              alert(error.message);
              return;
            }

            setSavedCharts((current) => [...current, data]);
            setEditingChart(null);
            setShowAddChartModal(false);
          }}
        />
      )}
    </div>
  );
}