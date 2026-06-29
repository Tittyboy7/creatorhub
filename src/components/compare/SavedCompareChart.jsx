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

  function formatChartValue(value) {
    const number = Number(value || 0);

    if (chart.metric === "revenue" || chart.metric.includes("revenue")) {
      if (Math.abs(number) >= 1000000) {
        return `$${(number / 1000000).toFixed(1)}M`;
      }

      if (Math.abs(number) >= 1000) {
        return `$${Math.round(number / 1000)}k`;
      }

      return `$${number.toLocaleString()}`;
    }

    if (Math.abs(number) >= 1000000) {
      return `${(number / 1000000).toFixed(1)}M`;
    }

    if (Math.abs(number) >= 1000) {
      return `${Math.round(number / 1000)}k`;
    }

    return number.toLocaleString();
  }

  function formatExactChartValue(value) {
    const number = Number(value || 0);

    if (chart.metric === "revenue" || chart.metric.includes("revenue")) {
      return number.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      });
    }

    return number.toLocaleString();
  }

  function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;

    const value = payload[0]?.value;

    return (
      <div className="rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm shadow-2xl shadow-black/40">
        <p className="font-semibold text-white">
          {chart.compare_by === "month" ? `Month: ${label}` : `Platform: ${label}`}
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
      <div className="mb-4 flex justify-end gap-2">
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
                <YAxis tickFormatter={formatChartValue} width={56} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            ) : chart.chart_type === "pie" ? (
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
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
                <YAxis tickFormatter={formatChartValue} width={56} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  strokeWidth={3}
                  fillOpacity={0.25}
                />
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
                <YAxis tickFormatter={formatChartValue} width={56} />
                <Tooltip content={<CustomTooltip />} />
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