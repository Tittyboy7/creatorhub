import {
  formatCompareChartTitle,
  formatCompareChartSubtitle,
} from "@/lib/compare/formatCompareChartTitle";

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

      <div className="mt-3 rounded-3xl border border-zinc-800 bg-zinc-950/70 p-4">
        <h3 className="text-lg font-bold">
          {formatCompareChartTitle({
            metric,
            compare_by: compareBy,
          })}
        </h3>

        <p className="mt-1 text-sm text-zinc-500">
          {formatCompareChartSubtitle({
            chart_type: chartType,
            metric,
            time_period: timePeriod,
          })}
        </p>

        <div className="mt-5 flex h-28 items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-black/20 p-4">
          {chartType === "pie" ? (
            <div className="h-20 w-20 rounded-full border-[18px] border-blue-500 border-r-green-500 border-b-purple-500" />
          ) : chartType === "line" ? (
            <div className="h-16 w-full rounded-2xl border-b-4 border-l-4 border-blue-500" />
          ) : chartType === "area" ? (
            <div className="h-20 w-full rounded-2xl bg-gradient-to-r from-sky-500/50 via-purple-500/50 to-pink-500/50" />
          ) : (
            <div className="flex h-full w-full items-end gap-2">
              {[45, 70, 55, 90, 65].map((height, index) => (
                <div
                  key={index}
                  className="w-full rounded-t-lg bg-zinc-700"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}