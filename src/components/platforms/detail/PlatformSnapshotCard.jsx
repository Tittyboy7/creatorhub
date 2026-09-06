import PlatformTrendChart from "./design-system/visualization/PlatformTrendChart";

function getTrendStyles(trend) {
  if (!trend) {
    return {
      text: "text-zinc-500",
      symbol: "",
    };
  }

  if (
    trend.startsWith("-") ||
    trend.startsWith("↓")
  ) {
    return {
      text: "text-red-400",
      symbol: "↘",
    };
  }

  return {
    text: "text-emerald-400",
    symbol: "↗",
  };
}

function getMetricVisual(label = "") {
  const normalizedLabel = label.toLowerCase();

  if (normalizedLabel.includes("revenue")) {
  return {
    icon: "$",
    iconClass:
      "border-green-500/25 bg-green-500/10 text-green-300",
    accent: "green",
  };
}

  if (
    normalizedLabel.includes("view") &&
    !normalizedLabel.includes("watch")
  ) {
    return {
      icon: "◉",
      iconClass:
        "border-blue-500/25 bg-blue-500/10 text-blue-300",
      accent: "blue",
    };
  }

  if (
    normalizedLabel.includes("subscriber") ||
    normalizedLabel.includes("follower")
  ) {
    return {
      icon: "◎",
      iconClass:
        "border-violet-500/25 bg-violet-500/10 text-violet-300",
      accent: "violet",
    };
  }

  if (
    normalizedLabel.includes("watch") ||
    normalizedLabel.includes("time")
  ) {
    return {
      icon: "◷",
      iconClass:
        "border-cyan-500/25 bg-cyan-500/10 text-cyan-300",
      accent: "cyan",
    };
  }

  return {
    icon: "•",
    iconClass:
      "border-zinc-700 bg-zinc-800 text-zinc-300",
    accent: "violet",
  };
}

function SnapshotMetric({ metric }) {
  const trendStyles = getTrendStyles(metric.trend);
  const visual = getMetricVisual(metric.label);

  return (
    <article
      className="
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        border-zinc-800
        bg-black/15
        p-4
        transition
        hover:-translate-y-0.5
        hover:border-zinc-700
        hover:bg-zinc-900/80
      "
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            text-sm
            font-bold
            ${visual.iconClass}
          `}
        >
          {visual.icon}
        </div>

        <div className="w-24 shrink-0">
          {metric.history?.length ? (
            <PlatformTrendChart
              values={metric.history}
              accent={visual.accent}
              height="h-12"
              strokeWidth={2}
              showArea
            />
          ) : null}
        </div>
      </div>

      <p className="mt-4 text-xs font-medium text-zinc-500">
        {metric.label}
      </p>

      <div className="mt-1 flex flex-wrap items-end gap-x-3 gap-y-1">
        <p className="text-2xl font-bold tracking-tight text-white">
          {metric.value}
        </p>

        {metric.trend ? (
          <p
            className={`pb-0.5 text-xs font-semibold ${trendStyles.text}`}
          >
            {trendStyles.symbol}{" "}
            {metric.trend.replace(/^[↑↓]/, "")}
          </p>
        ) : null}
      </div>

      <p className="mt-2 text-[11px] text-zinc-600">
        Compared with the previous period
      </p>
    </article>
  );
}

export default function PlatformSnapshotCard({
  snapshot = [],
  periodLabel = "Last 28 days",
}) {
  const primaryMetrics = snapshot.slice(0, 4);

  return (
    <section
      id="platform-overview"
      className="
        scroll-mt-24
        rounded-3xl
        border
        border-zinc-800
        bg-zinc-900/70
        p-5
        backdrop-blur
        md:p-6
      "
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Performance overview
          </p>

          <h2 className="mt-1 text-xl font-bold text-white">
            Today’s Snapshot
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Your most important platform metrics at a glance.
          </p>
        </div>

        <span className="inline-flex w-fit rounded-full border border-zinc-800 bg-zinc-950/70 px-3 py-1.5 text-xs font-medium text-zinc-400">
          {periodLabel}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {primaryMetrics.map((metric) => (
          <SnapshotMetric
            key={metric.id || metric.label}
            metric={metric}
          />
        ))}
      </div>
    </section>
  );
}