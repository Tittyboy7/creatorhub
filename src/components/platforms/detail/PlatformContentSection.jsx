"use client";

import { useState } from "react";
import PlatformContentPerformanceChapter from "./PlatformContentPerformanceChapter";
import PlatformAudienceChapter from "./PlatformAudienceChapter";
import PlatformRevenueChapter from "./PlatformRevenueChapter";

function getTrendClass(trend) {
  if (!trend) {
    return "text-zinc-500";
  }

  if (trend.startsWith("-")) {
    return "text-red-400";
  }

  return "text-green-400";
}

function getImportanceLabel(importance) {
  if (importance === "primary") {
    return "Core Intelligence";
  }

  if (importance === "secondary") {
    return "Business Performance";
  }

  return "Deeper Analysis";
}

function getImportanceClass(importance) {
  if (importance === "primary") {
    return "border-blue-500/20 bg-blue-500/10 text-blue-300";
  }

  if (importance === "secondary") {
    return "border-zinc-700 bg-zinc-800 text-zinc-300";
  }

  return "border-zinc-800 bg-zinc-950 text-zinc-500";
}

function getLayoutClass(layout) {
  if (layout === "full") {
    return "lg:col-span-2";
  }

  return "lg:col-span-1";
}

function MetricItem({ metric }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-zinc-500">{metric.label}</p>

          <p className="mt-1 break-words text-xl font-bold text-white">
            {metric.value}
          </p>
        </div>

        {metric.trend && (
          <p
            className={`shrink-0 text-sm font-semibold ${getTrendClass(
              metric.trend
            )}`}
          >
            {metric.trend}
          </p>
        )}
      </div>

      {metric.detail && (
        <p className="mt-3 text-sm leading-6 text-zinc-500">
          {metric.detail}
        </p>
      )}
    </div>
  );
}

function ContentItem({ item }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {item.label}
      </p>

      <p className="mt-2 font-semibold text-white">{item.title}</p>

      {item.metric && (
        <p className="mt-1 text-sm text-zinc-500">{item.metric}</p>
      )}

      {item.detail && (
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          {item.detail}
        </p>
      )}
    </div>
  );
}

function SectionItems({ section }) {
  if (section.variant === "content") {
    return (
      <div className="grid gap-3 md:grid-cols-3">
        {section.items.map((item, index) => (
          <ContentItem
            key={item.id || `${section.key}-${index}`}
            item={item}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`grid gap-3 ${
        section.layout === "full"
          ? "sm:grid-cols-2 xl:grid-cols-4"
          : "sm:grid-cols-2"
      }`}
    >
      {section.items.map((metric, index) => (
        <MetricItem
          key={metric.id || `${section.key}-${index}`}
          metric={metric}
        />
      ))}
    </div>
  );
}

function StandardAnalyticsChapter({ section }) {
  const [isExpanded, setIsExpanded] = useState(
    section.defaultExpanded !== false
  );

  const sectionId = `platform-section-${section.key}`;
  const contentId = `${sectionId}-content`;

  return (
    <article
      id={sectionId}
      className={`scroll-mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 ${getLayoutClass(
        section.layout
      )}`}
    >
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={contentId}
        onClick={() => setIsExpanded((current) => !current)}
        className="flex w-full items-start justify-between gap-5 p-5 text-left transition hover:bg-zinc-800/40 md:p-6"
      >
        <div className="min-w-0">
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getImportanceClass(
              section.importance
            )}`}
          >
            {getImportanceLabel(section.importance)}
          </span>

          <h2 className="mt-3 text-xl font-bold text-white md:text-2xl">
            {section.label}
          </h2>

          {section.description && (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
              {section.description}
            </p>
          )}
        </div>

        <span className="shrink-0 text-sm font-semibold text-zinc-400">
          {isExpanded ? "Hide Analysis ↑" : "Expand Analysis →"}
        </span>
      </button>

      {isExpanded && (
        <div
          id={contentId}
          className="border-t border-zinc-800 px-5 pb-5 pt-5 md:px-6 md:pb-6"
        >
          {section.overview?.text ? (
            <div className="mb-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-300">
                {section.overview.label}
              </p>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                {section.overview.text}
              </p>
            </div>
          ) : null}

          <SectionItems section={section} />
        </div>
      )}
    </article>
  );
}

function AnalyticsChapter({ section }) {
  if (section.variant === "content") {
    return <PlatformContentPerformanceChapter section={section} />;
  }

  if (section.variant === "audience") {
    return <PlatformAudienceChapter section={section} />;
  }

  if (section.variant === "revenue") {
    return <PlatformRevenueChapter section={section} />;
  }

  return <StandardAnalyticsChapter section={section} />;
}

export default function PlatformContentSection({ sections = [] }) {
  const visibleSections = sections.filter(
    (section) => section?.items?.length > 0
  );

  if (visibleSections.length === 0) {
    return null;
  }

  const primarySections = visibleSections.filter(
    (section) => section.importance === "primary"
  );

  const remainingSections = visibleSections.filter(
    (section) => section.importance !== "primary"
  );

  return (
    <section aria-label="Platform analytics" className="space-y-5">
      {primarySections.map((section) => (
        <AnalyticsChapter key={section.key} section={section} />
      ))}

      {remainingSections.length > 0 && (
        <div className="grid items-start gap-5 lg:grid-cols-2">
          {remainingSections.map((section) => (
            <AnalyticsChapter key={section.key} section={section} />
          ))}
        </div>
      )}
    </section>
  );
}