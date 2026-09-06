"use client";

import Link from "next/link";
import { useState } from "react";
import PlatformTrendChart from "./PlatformTrendChart";

import {
  getAvailablePlatformMetrics,
  getDefaultPlatformMetricKeys,
  getPlatformMetricKey,
  resolvePlatformMetricKeys,
} from "./platformMetricRegistry";

const PLATFORM_VISUALS = {
  youtube: {
    accentText: "text-red-300",
    accentBorder: "border-red-500/30",
    glow:
      "before:bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.18),transparent_48%)]",
    iconBackground:
      "border-red-500/30 bg-red-500/15 text-red-300",
    lineColor: "#ef4444",
  },

  twitch: {
    accentText: "text-violet-300",
    accentBorder: "border-violet-500/30",
    glow:
      "before:bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.20),transparent_48%)]",
    iconBackground:
      "border-violet-500/30 bg-violet-500/15 text-violet-300",
    lineColor: "#8b5cf6",
  },

  shopify: {
    accentText: "text-emerald-300",
    accentBorder: "border-emerald-500/30",
    glow:
      "before:bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.18),transparent_48%)]",
    iconBackground:
      "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
    lineColor: "#22c55e",
  },

  patreon: {
    accentText: "text-orange-300",
    accentBorder: "border-orange-500/30",
    glow:
      "before:bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.18),transparent_48%)]",
    iconBackground:
      "border-orange-500/30 bg-orange-500/15 text-orange-300",
    lineColor: "#f97316",
  },

  stripe: {
    accentText: "text-indigo-300",
    accentBorder: "border-indigo-500/30",
    glow:
      "before:bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_48%)]",
    iconBackground:
      "border-indigo-500/30 bg-indigo-500/15 text-indigo-300",
    lineColor: "#6366f1",
  },

  paypal: {
    accentText: "text-blue-300",
    accentBorder: "border-blue-500/30",
    glow:
      "before:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_48%)]",
    iconBackground:
      "border-blue-500/30 bg-blue-500/15 text-blue-300",
    lineColor: "#3b82f6",
  },
};

const DEFAULT_VISUAL = {
  accentText: "text-zinc-300",
  accentBorder: "border-zinc-700",
  glow:
    "before:bg-[radial-gradient(circle_at_top_left,rgba(113,113,122,0.12),transparent_48%)]",
  iconBackground:
    "border-zinc-700 bg-zinc-800 text-zinc-300",
  lineColor: "#71717a",
};

function getStatusStyles(status) {
  if (status === "healthy") {
    return "border-emerald-500/25 bg-emerald-500/10 text-emerald-300";
  }

  if (status === "attention") {
    return "border-amber-500/25 bg-amber-500/10 text-amber-300";
  }

  return "border-zinc-700 bg-zinc-800 text-zinc-400";
}

function getStatusDot(status) {
  if (status === "healthy") {
    return "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]";
  }

  if (status === "attention") {
    return "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.7)]";
  }

  return "bg-zinc-500";
}

function getStatusLabel(status) {
  if (status === "healthy") return "Healthy";
  if (status === "attention") return "Attention";
  return "Unknown";
}

function getTrendClass(trend) {
  if (!trend) return "text-zinc-500";

  if (
    trend.startsWith("-") ||
    trend.startsWith("↓")
  ) {
    return "text-red-400";
  }

  return "text-emerald-400";
}

function getTrendSymbol(trend) {
  if (!trend) return "";

  if (
    trend.startsWith("-") ||
    trend.startsWith("↓")
  ) {
    return "↘";
  }

  return "↗";
}

function PlatformLogo({ platform, className = "" }) {
  const sharedClassName = `h-6 w-6 ${className}`;

  if (platform.key === "youtube") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        className={sharedClassName}
      >
        <rect
          x="3"
          y="6"
          width="18"
          height="12"
          rx="4"
          fill="currentColor"
        />

        <path
          d="m10 9 5 3-5 3V9Z"
          fill="currentColor"
          className="text-zinc-950"
        />
      </svg>
    );
  }

  if (platform.key === "twitch") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        className={sharedClassName}
      >
        <path
          d="M5 3h16v11l-5 5h-4l-3 3v-3H5V3Z"
          fill="currentColor"
        />

        <path
          d="M10 7v5M15 7v5"
          stroke="currentColor"
          className="text-zinc-950"
          strokeWidth="2"
        />
      </svg>
    );
  }

  if (platform.key === "shopify") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        className={sharedClassName}
      >
        <path
          d="M6.5 7.5h11l1.2 13h-14l1.8-13Z"
          fill="currentColor"
        />

        <path
          d="M9 8V6.7A3 3 0 0 1 12 4a3 3 0 0 1 3 2.7V8"
          stroke="currentColor"
          className="text-zinc-950"
          strokeWidth="1.7"
          strokeLinecap="round"
        />

        <path
          d="M14.8 11.3c-.7-.4-1.3-.5-1.9-.5-.7 0-1.1.2-1.1.6 0 .5.6.7 1.4 1 .9.3 2 .8 2 2.2 0 1.6-1.3 2.5-3.2 2.5-.9 0-1.8-.2-2.6-.7"
          stroke="currentColor"
          className="text-zinc-950"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <span className="text-lg font-black">
      {platform.name?.slice(0, 1)}
    </span>
  );
}

function Metric({
  stat,
  isSelected = false,
  onSelect = null,
  accentColor,
}) {
  const content = (
    <>
      <p className="truncate text-[11px] font-medium text-zinc-500">
        {stat.label}
      </p>

      <p className="mt-1 truncate text-lg font-bold tracking-tight text-white">
        {stat.value}
      </p>

      {stat.trend ? (
        <p
          className={`mt-1 text-xs font-semibold ${getTrendClass(
            stat.trend
          )}`}
        >
          {getTrendSymbol(
            stat.trend
          )}{" "}
          {stat.trend.replace(
            /^[↑↓]/,
            ""
          )}
        </p>
      ) : null}
    </>
  );

  const className = `
    relative
    min-w-0
    border-r
    border-zinc-800/80
    pr-3
    text-left
    last:border-r-0
    last:pr-0
    ${
      onSelect
        ? "cursor-pointer rounded-lg transition hover:bg-white/[0.025]"
        : ""
    }
  `;

  if (!onSelect) {
    return (
      <div className={className}>
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={className}
    >
      {content}

      {isSelected ? (
        <span
          aria-hidden="true"
          className="absolute -bottom-2 left-0 h-0.5 w-7 rounded-full"
          style={{
            backgroundColor:
              accentColor,
            boxShadow: `0 0 8px ${accentColor}`,
          }}
        />
      ) : null}
    </button>
  );
}

function LegacyMiniTrendChart({ color }) {
  const gradientId = `legacy-trend-${color.replace(
    "#",
    ""
  )}`;

  return (
    <div className="relative h-16 overflow-hidden">
      <svg
        aria-hidden="true"
        viewBox="0 0 420 72"
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        <defs>
          <linearGradient
            id={gradientId}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor={color}
              stopOpacity="0.22"
            />

            <stop
              offset="100%"
              stopColor={color}
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        <path
          d="M0 54 C25 51, 34 40, 58 44 C84 48, 91 30, 116 35 C143 40, 155 22, 181 29 C208 36, 216 18, 241 27 C268 37, 279 25, 302 31 C327 37, 345 20, 367 27 C389 33, 401 22, 420 17 L420 72 L0 72 Z"
          fill={`url(#${gradientId})`}
        />

        <path
          d="M0 54 C25 51, 34 40, 58 44 C84 48, 91 30, 116 35 C143 40, 155 22, 181 29 C208 36, 216 18, 241 27 C268 37, 279 25, 302 31 C327 37, 345 20, 367 27 C389 33, 401 22, 420 17"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export default function PlatformCard({
  platform,
  selectedMetricKeys: preferredMetricKeys = null,
}) {
  const visual =
    PLATFORM_VISUALS[platform.key] ||
    DEFAULT_VISUAL;

  const availableMetricKeys =
    Array.from(
      new Set(
        [
          ...(platform.todayStats || [])
            .map(
              (stat) =>
                stat.metricKey ||
                getPlatformMetricKey(
                  platform.key,
                  stat.label
                )
            ),

          ...(
            platform.trendHistory?.[
              platform.trendHistory.length -
                1
            ]?.metrics
              ? Object.keys(
                  platform.trendHistory[
                    platform.trendHistory.length -
                      1
                  ].metrics
                )
              : []
          ),
        ].filter(Boolean)
      )
    );

  const [
    customMetricKeys,
    setCustomMetricKeys,
  ] = useState(
    preferredMetricKeys || []
  );  

  const selectedMetricKeys =
    resolvePlatformMetricKeys({
      platformKey:
        platform.key,

      preferredMetricKeys:
        customMetricKeys,

      availableMetricKeys,
    });

  const availableMetrics =
    getAvailablePlatformMetrics({
      platformKey:
        platform.key,

      availableMetricKeys,
    });

  const defaultMetricKeys =
    getDefaultPlatformMetricKeys(
      platform.key
    );

  const defaultMetricKey =
    selectedMetricKeys[0] ||
    "views";

  const [selectedMetricKey, setSelectedMetricKey] =
    useState(defaultMetricKey);

  const [isMetricTransitioning, setIsMetricTransitioning] =
    useState(false);

  const [
    isMetricCustomizerOpen,
    setIsMetricCustomizerOpen,
  ] = useState(false);

  const [
    draftMetricKeys,
    setDraftMetricKeys,
  ] = useState([]);

function openMetricCustomizer() {
  setDraftMetricKeys(
    selectedMetricKeys
  );

  setIsMetricCustomizerOpen(
    true
  );
}

function toggleDraftMetric(
  metricKey
) {
  setDraftMetricKeys(
    (currentKeys) => {
      if (
        currentKeys.includes(
          metricKey
        )
      ) {
        return currentKeys.filter(
          (key) =>
            key !== metricKey
        );
      }

      if (
        currentKeys.length >= 4
      ) {
        return currentKeys;
      }

      return [
        ...currentKeys,
        metricKey,
      ];
    }
  );
}

async function applyMetricCustomization() {
  if (
    draftMetricKeys.length !== 4
  ) {
    return;
  }

  setCustomMetricKeys(
    draftMetricKeys
  );

  if (
    !draftMetricKeys.includes(
      selectedMetricKey
    )
  ) {
    setSelectedMetricKey(
      draftMetricKeys[0]
    );
  }

  setIsMetricCustomizerOpen(
    false
  );

  try {
    const response =
      await fetch(
        "/api/preferences/platform-hub",
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            platformKey:
              platform.key,

            metricKeys:
              draftMetricKeys,
          }),
        }
      );

    if (!response.ok) {
      const result =
        await response.json();

      console.warn(
        "Unable to save Platform Hub metric preferences.",
        result
      );
    }
  } catch (error) {
    console.warn(
      "Unable to save Platform Hub metric preferences.",
      error
    );
  }
}

  const hasInteractiveTrend =
    Boolean(
      platform.trendHistory?.length
    );

  const orderedTodayStats =
    selectedMetricKeys.length
      ? selectedMetricKeys
          .map((metricKey) =>
            platform.todayStats.find(
              (stat) =>
                stat.metricKey ===
                  metricKey ||
                getPlatformMetricKey(
                  platform.key,
                  stat.label
                ) === metricKey
            )
          )
          .filter(Boolean)
      : platform.todayStats.slice(0, 4);

  return (
    <article
      className={`
        group
        relative
        isolate
        overflow-hidden
        rounded-3xl
        border
        border-zinc-800
        bg-zinc-900/75
        p-5
        shadow-[0_18px_55px_rgba(0,0,0,0.24)]
        backdrop-blur
        transition
        duration-300
        before:pointer-events-none
        before:absolute
        before:inset-0
        before:-z-10
        before:opacity-80
        before:content-['']
        hover:-translate-y-1
        hover:border-zinc-700
        hover:shadow-[0_24px_70px_rgba(0,0,0,0.35)]
        ${visual.glow}
      `}
    >
      <div
        aria-hidden="true"
        className={`
          absolute
          inset-y-5
          left-0
          w-[2px]
          rounded-full
          bg-gradient-to-b
          from-current
          via-current/70
          to-transparent
          ${visual.accentText}
        `}
      />

      <header className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-2xl
              border
              ${visual.iconBackground}
            `}
          >
            <PlatformLogo platform={platform} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-xl font-bold tracking-tight text-white">
                {platform.name}
              </h2>

              {platform.type ? (
                <span className="rounded-full border border-zinc-700 bg-zinc-800/70 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">
                  {platform.type}
                </span>
              ) : null}
            </div>

            <p className="mt-1 truncate text-xs text-zinc-500">
              {platform.accountName}
            </p>
          </div>
        </div>

        <span
          title={
            platform.status === "attention"
              ? platform.attentionReason ||
                `Needs attention. Last synced ${platform.lastSynced}.`
              : undefined
          }
          className={`
            inline-flex
            shrink-0
            items-center
            gap-2
            rounded-full
            border
            px-3
            py-1.5
            text-xs
            font-semibold
            ${getStatusStyles(platform.status)}
          `}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${getStatusDot(
              platform.status
            )}`}
          />

          {getStatusLabel(platform.status)}
        </span>
      </header>

      <section className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Today
          </p>

          {availableMetricKeys.length > 4 ? (
            <button
              type="button"
              onClick={() => {
                if (
                  isMetricCustomizerOpen
                ) {
                  setIsMetricCustomizerOpen(
                    false
                  );

                  return;
                }

                openMetricCustomizer();
              }}
              aria-expanded={
                isMetricCustomizerOpen
              }
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium text-zinc-500 transition hover:bg-white/[0.035] hover:text-zinc-300"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="h-3.5 w-3.5"
              >
                <path
                  d="M4 7h10"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />

                <path
                  d="M18 7h2"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />

                <path
                  d="M4 17h2"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />

                <path
                  d="M10 17h10"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />

                <circle
                  cx="16"
                  cy="7"
                  r="2"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />

                <circle
                  cx="8"
                  cy="17"
                  r="2"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
              </svg>
              
              Customize
            </button>
          ) : null}
        </div>

        {isMetricCustomizerOpen ? (
          <div
            className="
              mt-3
              rounded-xl
              border
              border-zinc-800
              bg-black/25
              p-3
            "
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-zinc-200">
                  Customize metrics
                </p>

                <p className="mt-1 text-[11px] leading-4 text-zinc-500">
                  Choose exactly 4 metrics to show on this card.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setIsMetricCustomizerOpen(
                    false
                  )
                }
                aria-label="Close metric customization"
                className="
                  flex
                  h-7
                  w-7
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  text-zinc-500
                  transition
                  hover:bg-white/[0.04]
                  hover:text-zinc-300
                "
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4"
                >
                  <path
                    d="M6 6l12 12M18 6 6 18"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] text-zinc-500">
                  {draftMetricKeys.length} of 4 selected
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setDraftMetricKeys(
                      defaultMetricKeys
                    )
                  }
                  className="
                    text-[11px]
                    font-medium
                    text-zinc-500
                    transition
                    hover:text-zinc-300
                  "
                >
                  Restore defaults
                </button>
              </div>

              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {availableMetrics.map(
                  (metric) => {
                    const isSelected =
                      draftMetricKeys.includes(
                        metric.key
                      );

                    const isDisabled =
                      !isSelected &&
                      draftMetricKeys.length >=
                        4;

                    return (
                      <button
                        key={metric.key}
                        type="button"
                        disabled={
                          isDisabled
                        }
                        onClick={() =>
                          toggleDraftMetric(
                            metric.key
                          )
                        }
                        className={`
                          flex
                          min-w-0
                          items-center
                          gap-2.5
                          rounded-lg
                          border
                          px-3
                          py-2.5
                          text-left
                          transition
                          ${
                            isSelected
                              ? "border-zinc-600 bg-white/[0.05] text-zinc-200"
                              : "border-zinc-800 bg-black/10 text-zinc-500"
                          }
                          ${
                            isDisabled
                              ? "cursor-not-allowed opacity-40"
                              : "hover:border-zinc-700 hover:bg-white/[0.03]"
                          }
                        `}
                      >
                        <span
                          className={`
                            flex
                            h-4
                            w-4
                            shrink-0
                            items-center
                            justify-center
                            rounded
                            border
                            text-[10px]
                            ${
                              isSelected
                                ? "border-zinc-500 bg-zinc-700 text-white"
                                : "border-zinc-700"
                            }
                          `}
                        >
                          {isSelected
                            ? "✓"
                            : ""}
                        </span>
                          
                        <span className="truncate text-xs font-medium">
                          {metric.displayLabel}
                        </span>
                      </button>
                    );
                  }
                )}
              </div>

              <div className="mt-3 flex items-center justify-end gap-2 border-t border-zinc-800/80 pt-3">
                <button
                  type="button"
                  onClick={() =>
                    setIsMetricCustomizerOpen(
                      false
                    )
                  }
                  className="
                    rounded-lg
                    px-3
                    py-2
                    text-xs
                    font-medium
                    text-zinc-500
                    transition
                    hover:bg-white/[0.03]
                    hover:text-zinc-300
                  "
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    draftMetricKeys.length !==
                    4
                  }
                  onClick={
                    applyMetricCustomization
                  }
                  className="
                    rounded-lg
                    border
                    border-zinc-700
                    bg-zinc-800
                    px-3
                    py-2
                    text-xs
                    font-semibold
                    text-white
                    transition
                    hover:border-zinc-600
                    hover:bg-zinc-700
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          {orderedTodayStats
            .slice(0, 4)
            .map((stat) => {
              const metricKey =
                stat.metricKey ||
                getPlatformMetricKey(
                  platform.key,
                  stat.label
                );

              return (
                <Metric
                  key={stat.label}
                  stat={stat}
                  isSelected={
                    hasInteractiveTrend &&
                    metricKey ===
                      selectedMetricKey
                  }
                  onSelect={
                    hasInteractiveTrend
                      ? () => {
                          if (
                            metricKey === selectedMetricKey ||
                            isMetricTransitioning
                          ) {
                            return;
                          }

                          setIsMetricTransitioning(true);

                          window.setTimeout(() => {
                            setSelectedMetricKey(
                              metricKey
                            );

                            window.setTimeout(() => {
                              setIsMetricTransitioning(
                                false
                              );
                            }, 40);
                          }, 120);
                        }
                      : null
                  }
                  accentColor={
                    visual.lineColor
                  }
                />
              );
            })}
        </div>
      </section>

      <div className="mt-5 border-y border-zinc-800/80 py-3">
        {platform.trendHistory?.length ? (
          <div
            className={`
              transition-all
              duration-200
              ${
                isMetricTransitioning
                  ? "translate-y-1 opacity-30"
                  : "translate-y-0 opacity-100"
              }
            `}
          >
            <PlatformTrendChart
              color={visual.lineColor}
              history={platform.trendHistory}
              metricKey={selectedMetricKey}
              platformKey={platform.key}
            />
          </div>
        ) : (
          <LegacyMiniTrendChart
            color={visual.lineColor}
          />
        )}
      </div>

      <section className="mt-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
          {platform.summaryLabel || "Lifetime"}
        </p>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {platform.overallStats
            .slice(0, 4)
            .map((stat) => (
              <div
                key={stat.label}
                className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800/80 bg-black/15 px-3 py-2.5"
              >
                <p className="truncate text-xs text-zinc-500">
                  {stat.label}
                </p>

                <p className="shrink-0 text-sm font-semibold text-white">
                  {stat.value}
                </p>
              </div>
            ))}
        </div>
      </section>

      <footer className="mt-5 flex items-center justify-between gap-4 border-t border-zinc-800/80 pt-4">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${getStatusDot(
              platform.status
            )}`}
          />

          <p className="truncate text-xs text-zinc-500">
            Last synced{" "}
            <span className="font-medium text-zinc-300">
              {platform.lastSynced}
            </span>
          </p>
        </div>

        <Link
          href={`/platforms/${platform.key}`}
          className={`
            inline-flex
            shrink-0
            items-center
            gap-2
            text-sm
            font-semibold
            transition
            hover:text-white
            ${visual.accentText}
          `}
        >
          View Workspace

          <span aria-hidden="true">→</span>
        </Link>
      </footer>
    </article>
  );
}