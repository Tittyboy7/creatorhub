"use client";

import PlatformChapterLayout from "./PlatformChapterLayout";
import PlatformInsightCard from "./design-system/insight/PlatformInsightCard";
import PlatformMetricTile from "./design-system/metric/PlatformMetricTile";
import FeaturedContentHero from "./design-system/content/FeaturedContentHero";
import RecentUploadsStrip from "./design-system/content/RecentUploadsStrip";
import PerformanceLeaders from "./design-system/content/PerformanceLeaders";
import PlatformTrendChart from "./design-system/visualization/PlatformTrendChart";

function InsightsContentLayout({
  topContent,
  performanceMetrics,
  insight,
  recentUploads,
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)_240px]">
        <FeaturedContentHero
          content={topContent}
          compact
        />

        <div>
          {performanceMetrics.map((metric) => (
            <PlatformMetricTile
              key={metric.label}
              label={metric.label}
              value={metric.value}
              trend={metric.trend}
              layout="row"
              visualization={
                metric.history?.length ? (
                  <PlatformTrendChart
                    values={metric.history}
                    accent="violet"
                    height="h-8"
                    strokeWidth={2}
                    showArea={false}
                  />
                ) : null
              }
            />
          ))}
        </div>

        <PlatformInsightCard
          accent={insight.accent}
          insight={insight.text}
          actionLabel={insight.actionLabel}
        />
      </div>

      <RecentUploadsStrip
        uploads={recentUploads}
      />
    </div>
  );
}

function AnalyticsContentLayout({
  topContent,
  performanceMetrics,
  summary,
  recentUploads,
  rankedContent,
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 px-4 py-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-300">
              {summary.label}
            </p>

            <p className="mt-1 text-sm leading-6 text-zinc-300">
              {summary.text}
            </p>
          </div>

          <button
            type="button"
            className="inline-flex w-fit shrink-0 items-center text-sm font-semibold text-violet-200 transition hover:text-white"
          >
            Review explanation
            <span className="ml-2" aria-hidden="true">
              →
            </span>
          </button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        <FeaturedContentHero content={topContent} />

        <div className="grid gap-3 sm:grid-cols-2">
          {performanceMetrics.map((metric) => (
            <PlatformMetricTile
              key={metric.label}
              label={metric.label}
              value={metric.value}
              trend={metric.trend}
              detail="Compared with the previous reporting period."
              layout="card"
              size="large"
              visualization={
                metric.history?.length ? (
                  <PlatformTrendChart
                    values={metric.history}
                    accent="violet"
                    height="h-12"
                    strokeWidth={2.5}
                    showArea={false}
                  />
                ) : null
              }
            />
          ))}
        </div>
      </div>

      <RecentUploadsStrip
        uploads={recentUploads}
      />

      <PerformanceLeaders
        rankedContent={rankedContent}
      />
    </div>
  );
}

export default function PlatformContentPerformanceChapter({
  section,
  contentPerformance,
}) {
  if (!contentPerformance) {
    return null;
  }

  const topContent =
    contentPerformance.featuredContent ||
    section.items?.[0] || {
      label: "Top Content",
      title: "No recent content available",
      metric: "",
      comparison: "",
    };

  return (
    <PlatformChapterLayout
      id="content-performance"
      number="1"
      title={section.label}
      insightsDescription={section.description}
      analyticsDescription="Investigate the metrics and performance signals behind your recent content results."
      insightsAccent="violet"
      analyticsAccent="blue"
      defaultExpanded={section.defaultExpanded !== false}
      insightsContent={
        <InsightsContentLayout
          topContent={topContent}
          performanceMetrics={
            contentPerformance.metrics
          }
          insight={contentPerformance.insight}
          recentUploads={
            contentPerformance.rankedContent
              ?.recentUploads || []
          }
        />
      }
      analyticsContent={
        <AnalyticsContentLayout
          topContent={topContent}
          performanceMetrics={
            contentPerformance.metrics
          }
          summary={contentPerformance.summary}
          recentUploads={
            contentPerformance.rankedContent
              ?.recentUploads || []
          }
          rankedContent={
            contentPerformance.rankedContent
          }
        />
      }
    />
  );
}