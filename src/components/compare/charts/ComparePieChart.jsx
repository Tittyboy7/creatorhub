import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const chartColors = [
  "#3b82f6",
  "#22c55e",
  "#a855f7",
  "#f97316",
  "#ec4899",
  "#06b6d4",
  "#facc15",
  "#ef4444",
];

export default function ComparePieChart({
  chart,
  data = [],
  formatExactChartValue,
  CustomTooltip,
}) {
  const showLegend = chart.size === "large";

  return (
    <div
      className={`h-72 ${
        showLegend ? "grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]" : ""
      }`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<CustomTooltip />} />

          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius={65}
            outerRadius={100}
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.label}
                fill={chartColors[index % chartColors.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {showLegend && (
        <div className="hidden space-y-3 overflow-y-auto pr-1 lg:block">
          {data.slice(0, 8).map((item, index) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-2 text-xs"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: chartColors[index % chartColors.length] }}
                />

                <span className="truncate text-zinc-300">{item.label}</span>
              </div>

              <span className="shrink-0 font-semibold text-white">
                {formatExactChartValue(item.value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}