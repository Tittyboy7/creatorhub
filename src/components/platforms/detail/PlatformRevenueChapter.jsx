"use client";

import PlatformChapterLayout from "./PlatformChapterLayout";
import PlatformInsightCard from "./design-system/insight/PlatformInsightCard";
import PlatformMetricTile from "./design-system/metric/PlatformMetricTile";
import PlatformTrendChart from "./design-system/visualization/PlatformTrendChart";

function RevenueTrendChart({
  totalRevenue,
  history = [],
  analyticsMode = false,
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 md:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-zinc-500">
            Estimated Revenue
          </p>

          <div className="mt-1 flex flex-wrap items-end gap-2">
            <p
              className={`font-bold text-white transition-all duration-300 ${
                analyticsMode
                  ? "text-3xl md:text-4xl"
                  : "text-2xl"
              }`}
            >
              {totalRevenue.value}
            </p>

            <p className="pb-1 text-xs font-semibold text-green-400">
              {totalRevenue.trend}
            </p>
          </div>
        </div>

        <p className="text-xs text-zinc-600">
          {totalRevenue.periodLabel}
        </p>
      </div>

      <PlatformTrendChart
        values={history.map(
          (week) => week.revenue
        )}
        accent="green"
        height={
          analyticsMode
            ? "h-44"
            : "h-32"
        }
        strokeWidth={
          analyticsMode ? 3 : 2.5
        }
      />

      <div className="mt-1 flex items-center justify-between text-xs text-zinc-600">
        <span>Period start</span>
        <span>Today</span>
      </div>
    </div>
  );
}

function RevenueInsightsLayout({
  revenue,
}) {
  return (
    <div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_170px]">
        <RevenueTrendChart
          totalRevenue={revenue.totalRevenue}
          history={revenue.history}
        />

        <div>
          <PlatformMetricTile
            label={revenue.revenueToday.label}
            value={revenue.revenueToday.value}
            detail={revenue.revenueToday.detail}
            layout="row"
            size="small"
          />

          <PlatformMetricTile
            label={revenue.previousRevenue.label}
            value={revenue.previousRevenue.value}
            detail={revenue.previousRevenue.detail}
            layout="row"
            size="small"
          />
        </div>
      </div>

      <PlatformInsightCard
        eyebrow="What Matters"
        accent="green"
        insight={revenue.summary.text}
        actionLabel="View Full Revenue Report"
        className="mt-5 p-4"
      />
    </div>
  );
}

function RevenueAnalyticsLayout({
  revenue,
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-green-300">
              Revenue Overview
            </p>

            <p className="mt-1 text-sm leading-6 text-zinc-300">
              {revenue.summary.text}
            </p>
          </div>

          <button
            type="button"
            className="inline-flex w-fit shrink-0 items-center text-sm font-semibold text-green-200 transition hover:text-white"
          >
            Review explanation
            <span className="ml-2" aria-hidden="true">
              →
            </span>
          </button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <RevenueTrendChart
          totalRevenue={revenue.totalRevenue}
          history={revenue.history}
          analyticsMode
        />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <PlatformMetricTile
            label={revenue.revenueToday.label}
            value={revenue.revenueToday.value}
            detail={revenue.revenueToday.detail}
            layout="card"
            size="large"
          />

          <PlatformMetricTile
            label={revenue.previousRevenue.label}
            value={revenue.previousRevenue.value}
            detail={revenue.previousRevenue.detail}
            layout="card"
            size="large"
          />
        </div>
      </div>
    </div>
  );
}

export default function PlatformRevenueChapter({
  section,
  revenue,
}) {
  if (!revenue) {
    return null;
  }

  return (
    <PlatformChapterLayout
      id="platform-section-revenue"
      number="3"
      title={section.label}
      insightsDescription={section.description}
      analyticsDescription="Investigate revenue trends, source contribution, and earnings momentum."
      insightsAccent="green"
      analyticsAccent="blue"
      defaultExpanded={
        section.defaultExpanded !== false
      }
      insightsContent={
        <RevenueInsightsLayout
          revenue={revenue}
        />
      }
      analyticsContent={
        <RevenueAnalyticsLayout
          revenue={revenue}
        />
      }
    />
  );
}