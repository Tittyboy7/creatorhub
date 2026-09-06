"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  formatPlatformMetricValue,
  getPlatformMetricDefinition,
  getPlatformMetricTrendEvent,
} from "./platformMetricRegistry";

const TREND_RANGES = [
  {
    key: "28d",
    label: "28D",
    days: 28,
  },
  {
    key: "90d",
    label: "90D",
    days: 90,
  },
  {
    key: "1y",
    label: "1Y",
    days: 365,
  },
];

function buildTrendPath(
  history,
  width = 420,
  height = 72
) {
  if (!history?.length) {
    return null;
  }

  const values = history.map(
    (point) =>
      point.value || 0
  );

  const minimum =
    Math.min(...values);

  const maximum =
    Math.max(...values);

  const range =
    maximum - minimum || 1;

  const horizontalPadding = 2;
  const verticalPadding = 8;

  const usableWidth =
    width -
    horizontalPadding * 2;

  const usableHeight =
    height -
    verticalPadding * 2;

  const points = history.map(
    (point, index) => {
      const x =
        history.length === 1
          ? width / 2
          : horizontalPadding +
            (index /
              (history.length - 1)) *
              usableWidth;

      const normalizedValue =
        (point.value - minimum) /
        range;

      const y =
        height -
        verticalPadding -
        normalizedValue *
          usableHeight;

      return {
        x,
        y,
        historyPoint: point,
      };
    }
  );

  const linePath =
    points
      .map(
        (point, index) =>
          `${
            index === 0
              ? "M"
              : "L"
          }${point.x.toFixed(
            2
          )} ${point.y.toFixed(
            2
          )}`
      )
      .join(" ");

  const firstPoint =
    points[0];

  const lastPoint =
    points[
      points.length - 1
    ];

  const areaPath =
    `${linePath} ` +
    `L${lastPoint.x.toFixed(
      2
    )} ${height} ` +
    `L${firstPoint.x.toFixed(
      2
    )} ${height} Z`;

  return {
    linePath,
    areaPath,
    points,
  };
}

function getMeaningfulTrendEvent(
  events = []
) {
  const priority = [
    "viral_video",
    "sponsorship",
    "merchandise_launch",
    "missed_upload",
  ];

  for (const type of priority) {
    const event =
      events.find(
        (item) =>
          item.type === type
      );

    if (event) {
      return event;
    }
  }

  return null;
}

function formatTrendDate(
  dateString
) {
  if (!dateString) {
    return "";
  }

  const date =
    new Date(
      `${dateString}T00:00:00Z`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return dateString;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
    }
  ).format(date);
}

export default function PlatformTrendChart({
  color,
  history = [],
  metricKey = "views",
  platformKey = "youtube",
}) {
  const [rangeKey, setRangeKey] =
    useState("28d");

  const [
    hoveredIndex,
    setHoveredIndex,
  ] = useState(null);

  const [
    isTransitioning,
    setIsTransitioning,
  ] = useState(false);

  const metricConfig =
    getPlatformMetricDefinition(
      platformKey,
      metricKey
    ) ||
    getPlatformMetricDefinition(
      "youtube",
      "views"
    );

  const visibleHistory =
    useMemo(() => {
      const selectedRange =
        TREND_RANGES.find(
          (range) =>
            range.key ===
            rangeKey
        );

      const days =
        selectedRange?.days || 28;

      const rangeHistory =
        history.slice(-days);

      const metricHistory =
        metricConfig?.historyMode ===
        "activity-only"
          ? rangeHistory.filter(
              (point) =>
                point.streamedToday
            )
          : rangeHistory;

      return metricHistory.map(
        (point) => ({
          date: point.date,

          value:
            point.metrics?.[
              metricKey
            ] || 0,

          events:
            point.events || [],
        })
      );
    }, [
      history,
      rangeKey,
      metricKey,
      metricConfig,
    ]);

  const paths =
    useMemo(
      () =>
        buildTrendPath(
          visibleHistory
        ),
      [visibleHistory]
    );

  const hoveredPoint =
    hoveredIndex !== null
      ? visibleHistory[
          hoveredIndex
        ]
      : null;

  const hoveredEvent =
    hoveredPoint
      ? getMeaningfulTrendEvent(
          hoveredPoint.events
        )
      : null;

  const hoveredChartPoint =
    hoveredIndex !== null
      ? paths?.points?.[
          hoveredIndex
        ] || null
      : null;

  const eventPoints =
    paths?.points?.filter(
      (point) =>
        getPlatformMetricTrendEvent(
          point.historyPoint
            ?.events,
          metricConfig
        )
    ) || [];

  const gradientId =
    `trend-${platformKey}-${metricKey}-${color.replace(
      "#",
      ""
    )}`;

  if (!paths) {
    return null;
  }

  function beginChartTransition(
    callback
  ) {
    setHoveredIndex(null);
    setIsTransitioning(true);

    window.setTimeout(() => {
      callback();

      window.setTimeout(() => {
        setIsTransitioning(
          false
        );
      }, 40);
    }, 120);
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
          {metricConfig.trendLabel}
        </p>

        <div className="flex items-center gap-1">
          {TREND_RANGES.map(
            (range) => {
              const isActive =
                range.key ===
                rangeKey;

              return (
                <button
                  key={range.key}
                  type="button"
                  onClick={() => {
                    if (
                      range.key ===
                        rangeKey ||
                      isTransitioning
                    ) {
                      return;
                    }

                    beginChartTransition(
                      () => {
                        setRangeKey(
                          range.key
                        );
                      }
                    );
                  }}
                  className={`
                    rounded-md
                    px-2
                    py-1
                    text-[10px]
                    font-semibold
                    transition
                    ${
                      isActive
                        ? "bg-zinc-800 text-white"
                        : "text-zinc-600 hover:bg-zinc-800/60 hover:text-zinc-300"
                    }
                  `}
                >
                  {range.label}
                </button>
              );
            }
          )}
        </div>
      </div>

      <div
        className={`
          relative
          h-20
          overflow-visible
          transition-all
          duration-200
          ${
            isTransitioning
              ? "translate-y-1 opacity-30"
              : "translate-y-0 opacity-100"
          }
        `}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 420 72"
          preserveAspectRatio="none"
          className="h-16 w-full"
          onMouseMove={(
            event
          ) => {
            if (
              !visibleHistory.length
            ) {
              return;
            }

            const bounds =
              event.currentTarget
                .getBoundingClientRect();

            const relativeX =
              event.clientX -
              bounds.left;

            const ratio =
              Math.min(
                1,
                Math.max(
                  0,
                  relativeX /
                    bounds.width
                )
              );

            const index =
              Math.round(
                ratio *
                  (
                    visibleHistory.length -
                    1
                  )
              );

            setHoveredIndex(
              index
            );
          }}
          onMouseLeave={() =>
            setHoveredIndex(
              null
            )
          }
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
                stopOpacity="0.24"
              />

              <stop
                offset="100%"
                stopColor={color}
                stopOpacity="0"
              />
            </linearGradient>
          </defs>

          <path
            d={paths.areaPath}
            fill={`url(#${gradientId})`}
          />

          <path
            d={paths.linePath}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {eventPoints.map(
            (point, index) => {
              const event =
                getPlatformMetricTrendEvent(
                  point
                    .historyPoint
                    ?.events,
                  metricConfig
                );

              if (!event) {
                return null;
              }

              return (
                <circle
                  key={`${
                    point
                      .historyPoint
                      ?.date ||
                    "event"
                  }-${
                    event.type
                  }-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r="2.5"
                  fill={color}
                  stroke="#18181b"
                  strokeWidth="1.5"
                  opacity="0.9"
                />
              );
            }
          )}

          {hoveredChartPoint ? (
            <>
              <line
                x1={
                  hoveredChartPoint.x
                }
                y1="4"
                x2={
                  hoveredChartPoint.x
                }
                y2="68"
                stroke="currentColor"
                strokeOpacity="0.18"
                strokeWidth="1"
              />

              <circle
                cx={
                  hoveredChartPoint.x
                }
                cy={
                  hoveredChartPoint.y
                }
                r="4"
                fill={color}
                stroke="white"
                strokeWidth="1.5"
                style={{
                  filter:
                    `drop-shadow(0 0 5px ${color})`,
                }}
              />
            </>
          ) : null}
        </svg>

        {hoveredPoint ? (
          <div
            className="
              pointer-events-none
              absolute
              top-0
              z-20
              -translate-y-full
              rounded-lg
              border
              border-zinc-700
              bg-zinc-950/95
              px-2.5
              py-2
              shadow-xl
              backdrop-blur
            "
            style={{
              left: `${
                visibleHistory.length >
                1
                  ? (
                      hoveredIndex /
                      (
                        visibleHistory.length -
                        1
                      )
                    ) * 100
                  : 50
              }%`,

              transform:
                hoveredIndex >
                visibleHistory.length /
                  2
                  ? "translate(-100%, -6px)"
                  : "translate(0, -6px)",
            }}
          >
            <p className="text-[10px] font-medium text-zinc-500">
              {formatTrendDate(
                hoveredPoint.date
              )}
            </p>

            <p className="mt-0.5 text-xs font-semibold text-white">
              {formatPlatformMetricValue(
                hoveredPoint.value,
                metricConfig
              )}

              {metricConfig.valueLabel ? (
                <span className="ml-1 font-medium text-zinc-500">
                  {
                    metricConfig.valueLabel
                  }
                </span>
              ) : null}
            </p>

            {hoveredEvent ? (
              <div className="mt-1.5 border-t border-zinc-800 pt-1.5">
                <p
                  className="text-[10px] font-semibold"
                  style={{
                    color,
                  }}
                >
                  {
                    hoveredEvent.label
                  }
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}