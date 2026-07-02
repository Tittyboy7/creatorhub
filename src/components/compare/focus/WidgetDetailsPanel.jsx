function formatValue(value = "") {
  return String(value).replaceAll("_", " ");
}

export default function WidgetDetailsPanel({ chart }) {
  const platforms = chart?.config?.platforms || [];

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5">
      <h3 className="text-lg font-bold text-white">Widget Details</h3>

      <div className="mt-5 space-y-4 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">Metric</p>
          <p className="mt-1 capitalize text-white">{formatValue(chart.metric)}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">Compare by</p>
          <p className="mt-1 capitalize text-white">{formatValue(chart.compare_by)}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">Chart type</p>
          <p className="mt-1 capitalize text-white">{formatValue(chart.chart_type)}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">Platforms</p>
          <p className="mt-1 text-white">
            {platforms.length ? platforms.join(", ") : "All platforms"}
          </p>
        </div>
      </div>
    </section>
  );
}