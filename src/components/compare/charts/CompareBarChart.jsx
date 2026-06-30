import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
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

export default function CompareBarChart({
  chart,
  data = [],
  CustomTooltip,
  formatChartValue,
  formatXAxisTick,
  xAxisInterval,
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis
          dataKey="label"
          interval={xAxisInterval}
          minTickGap={24}
          tickFormatter={formatXAxisTick}
          tick={{ fontSize: chart.size === "small" ? 10 : 12 }}
          axisLine={false}
          tickLine={false}
        />

        <YAxis
          tickFormatter={formatChartValue}
          width={56}
          axisLine={false}
          tickLine={false}
        />

        <Tooltip content={<CustomTooltip />} />

        <Bar
          dataKey="value"
          radius={[10, 10, 4, 4]}
          maxBarSize={64}
        >
          {data.map((entry, index) => (
            <Cell
              key={entry.label}
              fill={chartColors[index % chartColors.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}