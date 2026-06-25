export default function StatTrend({ value = 0, label = "vs previous period" }) {
  const numericValue = Number(value || 0);
  const isPositive = numericValue >= 0;

  return (
    <div className="mt-2 flex items-center gap-2 text-sm">
      <span
        className={
          isPositive
            ? "font-semibold text-green-400"
            : "font-semibold text-red-400"
        }
      >
        {isPositive ? "↑" : "↓"} {Math.abs(numericValue)}%
      </span>

      <span className="text-zinc-500">{label}</span>
    </div>
  );
}