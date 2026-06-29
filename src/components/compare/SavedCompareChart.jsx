import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const comparisonChartColors = [
  "#3b82f6",
  "#22c55e",
  "#a855f7",
  "#f97316",
  "#ec4899",
  "#06b6d4",
  "#facc15",
  "#ef4444",
];

export default function SavedCompareChart({
  chart,
  data = [],
  onDelete,
  onResize,
  onEdit,
}) {

  const hasData = data.length > 0;
  const isMonthChart = chart.compare_by === "month";
  const isSmallChart = chart.size === "small";
  const isMediumChart = chart.size === "medium";
 
  const xAxisInterval = isMonthChart
    ? isSmallChart
      ? 0
      : isMediumChart
      ? 3
      : 1
    : isSmallChart
    ? "preserveStartEnd"
    : isMediumChart
    ? "preserveStartEnd"
    : 0;
 
  function formatXAxisTick(value, index) {
    if (isMonthChart && isSmallChart) {
      if (index === 0 || index === data.length - 1) return value;
      return "";
    }
 
    return value;
  }

  return (
    <div
      className={`rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-5 shadow-2xl shadow-black/20 ${
        chart.size === "large"
          ? "md:col-span-2 xl:col-span-3"
          : chart.size === "medium"
          ? "xl:col-span-2"
          : ""
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Saved Chart
        </p>

        <h3 className="mt-2 text-lg font-bold capitalize">{chart.title}</h3>

        <p className="mt-1 text-sm text-zinc-500">
          {chart.chart_type} chart · {chart.metric} · {chart.time_period}
        </p>
      </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onEdit?.(chart)}
            className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => onDelete?.(chart.id)}
            className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-400 hover:border-red-500/60 hover:bg-red-500/10 hover:text-red-300"
          >
            Remove
          </button>
        </div>

      {!hasData ? (
        <div className="rounded-2xl border border-dashed border-zinc-700 p-8 text-center">
          <p className="text-sm text-zinc-400">
            No data available for this saved chart yet.
          </p>
        </div>
      ) : (
        <div className="h-72 rounded-3xl border border-zinc-800 bg-zinc-950/70 p-4">
          <ResponsiveContainer width="100%" height="100%">
            {chart.chart_type === "line" ? (
              <LineChart data={data}>
                <XAxis
                  dataKey="label"
                  interval={xAxisInterval}
                  minTickGap={24}
                  tickFormatter={formatXAxisTick}
                  tick={{ fontSize: chart.size === "small" ? 10 : 12 }}
                />
                <YAxis />
                <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                <Line type="monotone" dataKey="value" strokeWidth={3} />
              </LineChart>
            ) : chart.chart_type === "pie" ? (
              <PieChart>
                <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={2}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={entry.label}
                      fill={
                        comparisonChartColors[
                          index % comparisonChartColors.length
                        ]
                      }
                    />
                  ))}
                </Pie>
              </PieChart>
            ) : chart.chart_type === "area" ? (
              <AreaChart data={data}>
                <XAxis
                  dataKey="label"
                  interval={xAxisInterval}
                  minTickGap={24}
                  tickFormatter={formatXAxisTick}
                  tick={{ fontSize: chart.size === "small" ? 10 : 12 }}
                />
                <YAxis />
                <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                <Area type="monotone" dataKey="value" />
              </AreaChart>
            ) : (
              <BarChart data={data}>
                <XAxis
                  dataKey="label"
                  interval={xAxisInterval}
                  minTickGap={24}
                  tickFormatter={formatXAxisTick}
                  tick={{ fontSize: chart.size === "small" ? 10 : 12 }}
                />
                <YAxis />
                <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell
                      key={entry.label}
                      fill={
                        comparisonChartColors[
                          index % comparisonChartColors.length
                        ]
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}