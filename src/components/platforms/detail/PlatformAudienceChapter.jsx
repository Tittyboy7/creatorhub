"use client";

import PlatformChapterLayout from "./PlatformChapterLayout";
import PlatformInsightCard from "./design-system/insight/PlatformInsightCard";
import PlatformMetricTile from "./design-system/metric/PlatformMetricTile";

import gamingStreamer from "@/lib/simulation/creators/gamingStreamer";
import buildBusinessSignals from "@/lib/simulation/engine/buildBusinessSignals";
import buildYouTubeAudience from "@/lib/simulation/adapters/youtube/buildAudience";

function AudienceDonut({
  total = "24.9K",
  analyticsMode = false,
}) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`relative flex items-center justify-center rounded-full transition-all duration-300 ${
          analyticsMode
            ? "h-44 w-44"
            : "h-36 w-36"
        }`}
        style={{
          background:
            "conic-gradient(#8b5cf6 0deg 225deg, #3b82f6 225deg 360deg)",
        }}
      >
        <div
          className={`flex flex-col items-center justify-center rounded-full bg-zinc-950 transition-all duration-300 ${
            analyticsMode
              ? "h-[126px] w-[126px]"
              : "h-[104px] w-[104px]"
          }`}
        >
          <p
            className={`font-bold text-white transition-all duration-300 ${
              analyticsMode
                ? "text-3xl"
                : "text-2xl"
            }`}
          >
            {total}
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            Viewers
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs">
        <div className="flex items-center gap-2 text-zinc-400">
          <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />
          New viewers
        </div>

        <div className="flex items-center gap-2 text-zinc-400">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          Returning viewers
        </div>
      </div>
    </div>
  );
}

function InsightsAudienceLayout({
  audienceTotal,
  returningViewers,
  newViewers,
  subscriberGrowth,
  insight,
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[180px_minmax(0,1fr)_240px]">
      <AudienceDonut total={audienceTotal} />

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

      <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Viewer Distribution
          </p>

          <div className="mt-5">
            <AudienceDonut
              total={audienceTotal}
              analyticsMode
            />
          </div>

          <div className="mt-6 space-y-3 border-t border-zinc-800 pt-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />
                New viewers
              </div>

              <p className="font-semibold text-white">
                {composition.newViewerPercent}%
              </p>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                Returning viewers
              </div>

              <p className="font-semibold text-white">
                40%
              </p>
            </div>
          </div>
        </div>

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
            />
          ))}

          <PlatformMetricTile
            label="Audience Momentum"
            value="Strong"
            trend="+14%"
            detail="Audience growth remains positive across both new and returning viewers."
            layout="card"
            size="large"
          />
        </div>
      </div>
    </div>
  );
}

export default function PlatformAudienceChapter({
  section,
}) {
  const signals = buildBusinessSignals(gamingStreamer);

  const audience = buildYouTubeAudience({
    creator: gamingStreamer,
    signals,
  });

  if (!audience) {
    return null;
  }

  const {
    returningViewers,
    newViewers,
    subscriberGrowth,
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
          summary={audience.summary}
          composition={audience.composition}
        />
      }
    />
  );
}