export default function WidgetPreviewPanel({
  metric,
  compareBy,
  chartType,
  timePeriod,
}) {
  return (
    <section className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Preview
      </p>

      <h3 className="mt-2 text-lg font-bold capitalize">
        {metric} by {compareBy.replaceAll("_", " ")}
      </h3>

      <p className="mt-2 text-sm text-zinc-500 capitalize">
        {chartType} widget · {timePeriod}
      </p>

      <div className="mt-5 rounded-2xl border border-dashed border-zinc-700 p-8 text-center">
        <p className="text-sm text-zinc-400">
          This widget will be added to your saved workspace.
        </p>
      </div>
    </section>
  );
}