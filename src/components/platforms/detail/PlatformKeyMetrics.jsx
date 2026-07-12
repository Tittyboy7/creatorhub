function getTrendClass(trend) {
  if (!trend) return "text-zinc-500";
  if (trend.startsWith("-")) return "text-red-400";
  return "text-green-400";
}

export default function PlatformKeyMetrics({ metrics }) {
  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white">Today&apos;s Performance</h2>
        <p className="mt-1 text-sm text-zinc-500">
          The most important platform signals from today.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
          >
            <p className="text-sm text-zinc-500">{metric.label}</p>

            <div className="mt-2 flex items-end justify-between gap-3">
              <p className="text-2xl font-bold text-white">{metric.value}</p>

              {metric.trend && (
                <p className={`text-sm font-semibold ${getTrendClass(metric.trend)}`}>
                  {metric.trend}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}