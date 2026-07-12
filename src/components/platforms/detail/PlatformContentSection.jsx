export default function PlatformContentSection({
  contentPerformance,
  audienceMetrics,
  revenueMetrics,
}) {
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="text-xl font-bold text-white">Content Performance Review</h2>

        <p className="mt-1 text-sm text-zinc-500">
          Review the content signals connected to today&apos;s recommendation.
        </p>

        <div className="mt-4 space-y-3">
          {contentPerformance.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {item.label}
              </p>

              <p className="mt-2 font-semibold text-white">{item.title}</p>

              <p className="mt-1 text-sm text-zinc-500">{item.metric}</p>
            </div>
          ))}
        </div>
      </div>

      <MetricGroup title="Audience" metrics={audienceMetrics} />

      <MetricGroup title="Revenue" metrics={revenueMetrics} />
    </section>
  );
}

function MetricGroup({ title, metrics }) {
  return (
    <div
      id="content-performance" 
      className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
      <h2 className="text-xl font-bold text-white">{title}</h2>

      <p className="mt-1 text-sm text-zinc-500">
        Key {title.toLowerCase()} signals.
      </p>

      <div className="mt-4 space-y-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
          >
            <div>
              <p className="text-sm text-zinc-500">{metric.label}</p>
              <p className="mt-1 text-xl font-bold text-white">
                {metric.value}
              </p>
            </div>

            <p
              className={`text-sm font-semibold ${
                metric.trend?.startsWith("-")
                  ? "text-red-400"
                  : "text-green-400"
              }`}
            >
              {metric.trend}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}