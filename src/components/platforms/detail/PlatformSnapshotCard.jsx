function getTrendClass(trend) {
  if (!trend) {
    return "text-zinc-500";
  }

  if (trend.startsWith("-")) {
    return "text-red-400";
  }

  return "text-green-400";
}

function SnapshotMetric({ metric }) {
  return (
    <div className="min-w-0 border-zinc-800 lg:border-l lg:first:border-l-0 lg:pl-6 lg:first:pl-0">
      <p className="text-sm text-zinc-500">{metric.label}</p>

      <div className="mt-2 flex flex-wrap items-end gap-x-3 gap-y-1">
        <p className="text-2xl font-bold text-white md:text-3xl">
          {metric.value}
        </p>

        {metric.trend && (
          <p
            className={`pb-1 text-sm font-semibold ${getTrendClass(
              metric.trend
            )}`}
          >
            {metric.trend}
          </p>
        )}
      </div>

      <p className="mt-2 text-xs text-zinc-600">
        Compared with the previous period
      </p>
    </div>
  );
}

function TrendPreview() {
  return (
    <div
      aria-hidden="true"
      className="hidden min-w-[150px] items-end justify-end lg:flex"
    >
      <svg
        viewBox="0 0 180 70"
        className="h-[70px] w-[180px]"
        role="presentation"
      >
        <defs>
          <linearGradient id="snapshotArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path
          d="M2 63 L2 50 L18 47 L32 18 L46 45 L61 51 L76 35 L91 42 L108 17 L123 54 L139 39 L156 12 L178 48 L178 63 Z"
          fill="url(#snapshotArea)"
          className="text-violet-500"
        />

        <path
          d="M2 50 L18 47 L32 18 L46 45 L61 51 L76 35 L91 42 L108 17 L123 54 L139 39 L156 12 L178 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-violet-400"
        />
      </svg>
    </div>
  );
}

export default function PlatformSnapshotCard({
  snapshot = [],
  periodLabel = "Last 28 days",
}) {
  const primaryMetrics = snapshot.slice(0, 4);

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Platform Snapshot</h2>

          <p className="mt-1 text-sm text-zinc-500">
            Your platform performance at a glance.
          </p>
        </div>

        <p className="text-sm font-medium text-zinc-500">{periodLabel}</p>
      </div>

      <div className="mt-6 flex flex-col gap-6 xl:flex-row xl:items-end">
        <div className="grid flex-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {primaryMetrics.map((metric) => (
            <SnapshotMetric key={metric.id} metric={metric} />
          ))}
        </div>

        <TrendPreview />
      </div>
    </section>
  );
}