"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { buildBusinessMetrics } from "@/lib/business/buildBusinessMetrics";
import { buildPlatformComparisonMetrics } from "@/lib/business/buildPlatformComparisonMetrics";
import { businessTimePeriods } from "@/lib/business/businessTimePeriods";

export default function ComparePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [revenueEntries, setRevenueEntries] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("30d");

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

      setRevenueEntries(revenueData || []);
      setProducts(productData || []);
      setLoading(false);
    }

    loadComparisonData();
  }, [router]);

  const comparisonMetrics = useMemo(() => {
    const businessMetrics = buildBusinessMetrics({
      revenueEntries,
      products,
    });

    return buildPlatformComparisonMetrics({
      metrics: businessMetrics,
    });
  }, [revenueEntries, products]);

  const platforms = [...new Set(comparisonMetrics.map((metric) => metric.platform))];
  const metricTypes = [...new Set(comparisonMetrics.map((metric) => metric.metric))];
  const metricsByPlatform = platforms.map((platform) => ({
    platform,
    metrics: comparisonMetrics.filter((metric) => metric.platform === platform),
  }));

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        Loading comparison workspace...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-5 py-6 text-white md:px-10 md:py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Platform Comparison
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Compare your creator business across platforms
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">
            Compare revenue, product activity, and future platform metrics in one place.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-2xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Back to Dashboard
            </Link>

            <Link
              href="/revenue"
              className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-zinc-200"
            >
              Revenue Intelligence
            </Link>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="text-xl font-bold">Comparison Controls</h2>

            <p className="mt-2 text-sm text-zinc-500">
              Available platforms and metrics from your connected business data.
            </p>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-sm font-semibold text-white">Platforms</p>
                <p className="mt-1 text-sm text-zinc-500">
                  {platforms.length > 0 ? platforms.join(", ") : "No platform data yet."}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-sm font-semibold text-white">Metrics</p>
                <p className="mt-1 text-sm text-zinc-500">
                  {metricTypes.length > 0 ? metricTypes.join(", ") : "No metrics available yet."}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-sm font-semibold text-white">Time Range</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {businessTimePeriods.map((period) => (
                    <button
                      key={period.key}
                      type="button"
                      onClick={() => setSelectedTimePeriod(period.key)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                        selectedTimePeriod === period.key
                          ? "bg-white text-black"
                          : "border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-2xl font-bold">Comparison Canvas</h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              This workspace is now connected to normalized business metrics. Charts and filters will be added next.
            </p>

            <div className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold">Available Comparison Data</h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    First normalized metrics from revenue and product activity.
                  </p>
                </div>
              </div>

              {comparisonMetrics.length === 0 ? (
                <p className="text-sm text-zinc-400">
                  Add revenue entries or products to start comparing platform performance.
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {metricsByPlatform.map((group) => (
                    <div
                      key={group.platform}
                      className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-bold">{group.platform}</h4>

                          <p className="mt-1 text-sm text-zinc-500">
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                            }).format(
                              group.metrics
                                .filter((metric) => metric.metric === "revenue")
                                .reduce((sum, metric) => sum + Number(metric.value || 0), 0)
                            )}{" "}
                            tracked revenue
                          </p>
                        </div>

                        <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
                          {group.metrics.length} metric
                          {group.metrics.length === 1 ? "" : "s"}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {group.metrics.slice(0, 4).map((metric) => (
                          <div
                            key={metric.id}
                            className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-3"
                          >
                            <div>
                              <p className="font-medium">{metric.label}</p>
                              <p className="text-xs text-zinc-500">
                                {metric.metric}
                              </p>
                            </div>

                            <p className="font-semibold">
                              {metric.unit === "currency"
                                ? new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                  }).format(metric.value)
                                : metric.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}