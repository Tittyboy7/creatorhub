"use client";

import PlatformChapterLayout from "./PlatformChapterLayout";
import PlatformInsightCard from "./design-system/insight/PlatformInsightCard";
import PlatformMetricTile from "./design-system/metric/PlatformMetricTile";

function RevenueTrendChart({
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
              $4,128
            </p>

            <p className="pb-1 text-xs font-semibold text-green-400">
              +22%
            </p>
          </div>
        </div>

        <p className="text-xs text-zinc-600">
          Last 28 days
        </p>
      </div>

      <svg
        viewBox="0 0 320 130"
        aria-hidden="true"
        className={`mt-4 w-full text-green-400 transition-all duration-300 ${
          analyticsMode ? "h-44" : "h-32"
        }`}
      >
        <defs>
          <linearGradient
            id={
              analyticsMode
                ? "revenueAnalyticsArea"
                : "revenueInsightsArea"
            }
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="currentColor"
              stopOpacity="0.3"
            />

            <stop
              offset="100%"
              stopColor="currentColor"
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        <path
          d="M8 116 L8 99 L34 91 L57 104 L82 74 L106 88 L132 52 L158 69 L184 34 L209 57 L235 22 L260 48 L286 16 L312 39 L312 116 Z"
          fill={`url(#${
            analyticsMode
              ? "revenueAnalyticsArea"
              : "revenueInsightsArea"
          })`}
        />

        <path
          d="M8 99 L34 91 L57 104 L82 74 L106 88 L132 52 L158 69 L184 34 L209 57 L235 22 L260 48 L286 16 L312 39"
          fill="none"
          stroke="currentColor"
          strokeWidth={analyticsMode ? "3" : "2.5"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M8 116 H312"
          stroke="currentColor"
          strokeOpacity="0.12"
        />
      </svg>

      <div className="mt-1 flex items-center justify-between text-xs text-zinc-600">
        <span>Period start</span>
        <span>Today</span>
      </div>
    </div>
  );
}

function RevenueInsightsLayout({
  metrics,
}) {
  return (
    <div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_170px]">
        <RevenueTrendChart />

        <div>
          {metrics.map((metric, index) => (
            <PlatformMetricTile
              key={
                metric.id ||
                metric.label ||
                `revenue-insight-${index}`
              }
              label={metric.label}
              value={metric.value}
              trend={metric.trend}
              detail={metric.detail}
              layout="row"
              size="small"
            />
          ))}
        </div>
      </div>

      <PlatformInsightCard
        accent="green"
        insight="YouTube revenue is trending upward, supported by stronger advertising earnings and increased Supers activity. Membership growth is positive, but it is contributing less than your other revenue sources."
        actionLabel="View Full Revenue Report"
        className="mt-5 p-4"
      />
    </div>
  );
}

function RevenueAnalyticsLayout({
  metrics,
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-green-300">
              Insight Summary
            </p>

            <p className="mt-1 text-sm leading-6 text-zinc-300">
              Revenue increased across advertising,
              memberships, and Supers, with advertising
              remaining the largest contributor.
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
        <RevenueTrendChart analyticsMode />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          {metrics.map((metric, index) => (
            <PlatformMetricTile
              key={
                metric.id ||
                metric.label ||
                `revenue-analytics-${index}`
              }
              label={metric.label}
              value={metric.value}
              trend={metric.trend}
              detail={
                metric.detail ||
                "Compared with the previous reporting period."
              }
              layout="card"
              size="large"
            />
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <PlatformMetricTile
          label="Largest Revenue Source"
          value="Advertising"
          trend="+11%"
          detail="Advertising remains the strongest contributor to YouTube earnings."
          layout="card"
        />

        <PlatformMetricTile
          label="Revenue Momentum"
          value="Strong"
          trend="+22%"
          detail="Total YouTube earnings continue to trend above the previous period."
          layout="card"
        />
      </div>
    </div>
  );
}

export default function PlatformRevenueChapter({
  section,
}) {
  const metrics = section.items || [];

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
        <RevenueInsightsLayout metrics={metrics} />
      }
      analyticsContent={
        <RevenueAnalyticsLayout metrics={metrics} />
      }
    />
  );
}