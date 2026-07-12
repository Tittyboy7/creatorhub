import Link from "next/link";

function getTrendClass(trend) {
  if (!trend) return "text-zinc-500";
  if (trend.startsWith("-")) return "text-red-400";
  return "text-green-400";
}

function MetricPill({ metric }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3">
      <p className="text-xs text-zinc-500">{metric.label}</p>

      <div className="mt-1 flex items-center gap-3">
        <p className="text-xl font-bold text-white">{metric.value}</p>

        {metric.trend && (
          <p className={`text-xs font-semibold ${getTrendClass(metric.trend)}`}>
            {metric.trend}
          </p>
        )}
      </div>
    </div>
  );
}

export default function PlatformTodaySection({ brief }) {
  const primaryMetrics = brief.metrics.slice(0, 4);

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Today&apos;s Intelligence
      </p>

      <div className="mt-2 max-w-3xl">
        <h2 className="text-2xl font-bold leading-tight text-white">
          {brief.headline}
        </h2>

        <p className="mt-3 text-sm leading-6 text-zinc-400">
          {brief.summary}
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {primaryMetrics.map((metric) => (
          <MetricPill key={metric.label} metric={metric} />
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
        <p className="text-sm font-semibold text-white">
          Recommended Next Step
        </p>

        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="max-w-3xl text-sm leading-6 text-zinc-400">
            {brief.recommendation}
          </p>

          {brief.action && (
            <Link
              href={brief.action.href}
              className="inline-flex w-fit shrink-0 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              {brief.action.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}