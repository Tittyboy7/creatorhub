"use client";

import PlatformChapterLayout from "./PlatformChapterLayout";
import PlatformInsightCard from "./design-system/insight/PlatformInsightCard";
import PlatformMetricTile from "./design-system/metric/PlatformMetricTile";
import gamingStreamer from "@/lib/simulation/creators/gamingStreamer";
import buildBusinessSignals from "@/lib/simulation/engine/buildBusinessSignals";
import buildYouTubeContentPerformance from "@/lib/simulation/adapters/youtube/buildContentPerformance";
import buildSimulationSnapshot from "@/lib/simulation/buildSimulationSnapshot";
import buildYouTubePlatformData from "@/lib/simulation/adapters/youtube/buildPlatformData";

function MiniTrendLine({ expanded = false }) {
  return (
    <svg
      viewBox="0 0 120 32"
      aria-hidden="true"
      className={`w-full text-violet-400 transition-all duration-300 ${
        expanded ? "h-12" : "h-8"
      }`}
    >
      <path
        d="M2 24 C14 23, 17 17, 28 19 S45 27, 56 18 S72 8, 84 15 S100 23, 118 8"
        fill="none"
        stroke="currentColor"
        strokeWidth={expanded ? "2.5" : "2"}
        strokeLinecap="round"
      />
    </svg>
  );
}

function TopContentCard({ item, analyticsMode = false }) {
  return (
    <div
      className={`transition-all duration-300 ${
        analyticsMode ? "xl:max-w-none" : ""
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-violet-300">
        {item.label}
      </p>

      <div className="mt-3 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
        <div
          className={`flex items-center justify-center bg-gradient-to-br from-violet-500/20 via-zinc-900 to-red-500/10 transition-all duration-300 ${
            analyticsMode ? "h-40" : "aspect-video"
          }`}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/15 text-2xl text-violet-200">
            ▶
          </div>
        </div>

        <div className="p-4">
          <p className="font-semibold leading-6 text-white">{item.title}</p>

          {item.metric && (
            <p className="mt-1 text-sm text-zinc-500">{item.metric}</p>
          )}
        </div>
      </div>

      <div className="mt-3 inline-flex rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-200">
        +38% vs channel average
      </div>
    </div>
  );
}

function InsightsContentLayout({
  topContent,
  performanceMetrics,
  insight,
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)_240px]">
      <TopContentCard item={topContent} />

      <div>
        {performanceMetrics.map((metric) => (
          <PlatformMetricTile
            key={metric.label}
            label={metric.label}
            value={metric.value}
            trend={metric.trend}
            layout="row"
            visualization={<MiniTrendLine />}
          />
        ))}
      </div>

      <PlatformInsightCard
        accent={insight.accent}
        insight={insight.text}
        actionLabel={insight.actionLabel}
      />
    </div>
  );
}

function AnalyticsContentLayout({
  topContent,
  performanceMetrics,
  summary,
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

      <div className="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)]">
        <TopContentCard
          item={topContent}
          analyticsMode
        />

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
              visualization={<MiniTrendLine expanded />}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PlatformContentPerformanceChapter({
  section,
}) {
  const topContent = section.items[0];

  const simulation =
    buildSimulationSnapshot(gamingStreamer);

  const youtubePlatformData =
    buildYouTubePlatformData({
      creator: gamingStreamer,
      simulation,
    });

  if (!simulation || !youtubePlatformData) {
    return null;
  }

  const simulatedCreator = {
    ...gamingStreamer,

    platforms: {
      ...gamingStreamer.platforms,
      youtube: youtubePlatformData,
    },
  };

  const signals =
    buildBusinessSignals(simulatedCreator);

  const contentPerformance =
    buildYouTubeContentPerformance({
      creator: simulatedCreator,
      signals,
    });

  if (!contentPerformance) {
    return null;
  }

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
        />
      }
      analyticsContent={
        <AnalyticsContentLayout
          topContent={topContent}
          performanceMetrics={
            contentPerformance.metrics
          }
          summary={contentPerformance.summary}
        />
      }
    />
  );
}