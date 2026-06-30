export default function CompareChartTooltip({
  active,
  payload,
  label,
  chart,
  formatExactChartValue,
}) {
  if (!active || !payload?.length) return null;

  const value = payload[0]?.value;
  const labelPrefix = chart.compare_by === "month" ? "Month" : "Platform";

  return (
    <div className="rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm shadow-2xl shadow-black/40">
      <p className="font-semibold text-white">
        {labelPrefix}: {label}
      </p>

      <p className="mt-1 text-zinc-400 capitalize">
        {chart.metric}:{" "}
        <span className="font-semibold text-white">
          {formatExactChartValue(value)}
        </span>
      </p>
    </div>
  );
}