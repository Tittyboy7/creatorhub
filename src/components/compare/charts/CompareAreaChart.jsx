import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function CompareAreaChart({
  chart,
  data = [],
  CustomTooltip,
  formatChartValue,
  formatXAxisTick,
  xAxisInterval,
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient
            id={`areaGradient-${chart.id}`}
            x1="0"
            y1="0"
            x2="1"
            y2="0"
          >
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.45} />
            <stop offset="45%" stopColor="#8b5cf6" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#ec4899" stopOpacity={0.45} />
          </linearGradient>
        </defs>

        <XAxis
          dataKey="label"
          interval={xAxisInterval}
          minTickGap={24}
          tickFormatter={formatXAxisTick}
          tick={{ fontSize: Number(chart.width || 1) === 1 ? 10 : 12 }}
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

        <Area
          type="monotone"
          dataKey="value"
          stroke="#38bdf8"
          strokeWidth={3}
          fill={`url(#areaGradient-${chart.id})`}
          fillOpacity={1}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}