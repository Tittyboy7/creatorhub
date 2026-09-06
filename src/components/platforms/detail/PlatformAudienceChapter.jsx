"use client";

import PlatformChapterLayout from "./PlatformChapterLayout";
import PlatformInsightCard from "./design-system/insight/PlatformInsightCard";
import PlatformMetricTile from "./design-system/metric/PlatformMetricTile";
import AudienceOverviewCard from "./design-system/audience/AudienceOverviewCard";
import PlatformTrendChart from "./design-system/visualization/PlatformTrendChart";

import gamingStreamer from "@/lib/simulation/creators/gamingStreamer";
import buildBusinessSignals from "@/lib/simulation/engine/buildBusinessSignals";
import buildYouTubeAudience from "@/lib/simulation/adapters/youtube/buildAudience";
import buildSimulationSnapshot from "@/lib/simulation/buildSimulationSnapshot";
import buildYouTubePlatformData from "@/lib/simulation/adapters/youtube/buildPlatformData";

function InsightsAudienceLayout({
  audienceTotal,
  composition,
  returningViewers,
  newViewers,
  subscriberGrowth,
  insight,
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)_240px]">
      <AudienceOverviewCard
        totalAudience={audienceTotal}
        composition={composition}
        subscriberGrowth={subscriberGrowth}
        compact
      />

      <div>
        {returningViewers && (
          <PlatformMetricTile
            label={returningViewers.label}
            value={returningViewers.value}
            trend={returningViewers.trend}
            detail={returningViewers.detail}
            layout="row"
            size="small"
          />
        )}

        {newViewers && (
          <PlatformMetricTile
            label={newViewers.label}
            value={newViewers.value}
            trend={newViewers.trend}
            detail={newViewers.detail}
            layout="row"
            size="small"
          />
        )}

        {subscriberGrowth && (
          <PlatformMetricTile
            label={subscriberGrowth.label}
            value={subscriberGrowth.value}
            trend={subscriberGrowth.trend}
            detail={subscriberGrowth.detail}
            layout="row"
            size="small"
          />
        )}
      </div>

      <PlatformInsightCard
        eyebrow="What Matters"
        accent={insight.accent}
        insight={insight.text}
        actionLabel={insight.actionLabel}
        className="p-4"
      />
    </div>
  );
}

function AnalyticsAudienceLayout({
  audienceTotal,
  returningViewers,
  newViewers,
  subscriberGrowth,
  subscribersToday,
  summary,
  composition,
}) {
  const analyticsMetrics = [
    returningViewers,
    newViewers,
    subscriberGrowth,
  ].filter(Boolean);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 px-4 py-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-300">
                Audience Overview
              </p>

              <h3 className="mt-2 text-xl font-bold text-white">
                Discovery continues to outperform your returning audience.
              </h3>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
                {summary.text}
              </p>
            </div>
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

      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <AudienceOverviewCard
          totalAudience={audienceTotal}
          composition={composition}
          subscriberGrowth={subscriberGrowth}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          {analyticsMetrics.map((metric) => (
            <PlatformMetricTile
              key={metric.label}
              label={metric.label}
              value={metric.value}
              trend={metric.trend}
              detail={
                metric.detail ||
                "Compared with the previous reporting period."
              }
              layout="card"
              size="large"
              visualization={
                metric.history?.length ? (
                  <PlatformTrendChart
                    values={metric.history}
                    accent="blue"
                    height="h-12"
                    strokeWidth={2.5}
                    showArea={false}
                  />
                ) : null
              }
            />
          ))}

          {subscribersToday ? (
            <PlatformMetricTile
              label={subscribersToday.label}
              value={subscribersToday.value}
              detail={subscribersToday.detail}
              layout="card"
              size="large"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function PlatformAudienceChapter({
  section,
}) {

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

  const audience =
    buildYouTubeAudience({
      creator: simulatedCreator,
      signals,
    });
  
  if (!audience) {
    return null;
  }

  const {
    returningViewers,
    newViewers,
    subscriberGrowth,
    subscribersToday,
  } = audience.metrics;

  return (
    <PlatformChapterLayout
      id="platform-section-audience"
      number="2"
      title={section.label}
      insightsDescription={section.description}
      analyticsDescription="Investigate audience growth, viewer composition, and subscriber momentum."
      insightsAccent="violet"
      analyticsAccent="blue"
      defaultExpanded={section.defaultExpanded !== false}
      insightsContent={
        <InsightsAudienceLayout
          audienceTotal={audience.totalAudience}
          composition={audience.composition}
          returningViewers={returningViewers}
          newViewers={newViewers}
          subscriberGrowth={subscriberGrowth}
          insight={audience.insight}
        />
      }
      analyticsContent={
        <AnalyticsAudienceLayout
          audienceTotal={audience.totalAudience}
          returningViewers={returningViewers}
          newViewers={newViewers}
          subscriberGrowth={subscriberGrowth}
          subscribersToday={subscribersToday}
          summary={audience.summary}
          composition={audience.composition}
        />
      }
    />
  );
}