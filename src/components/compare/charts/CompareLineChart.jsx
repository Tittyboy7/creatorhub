import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function CompareLineChart({
  chart,
  data = [],
  seriesData,
  CustomTooltip,
  formatChartValue,
  formatXAxisTick,
  xAxisInterval,
}) {
  const chartData = seriesData?.data?.length ? seriesData.data : data;
  const series = seriesData?.series?.length
    ? seriesData.series
    : [{ key: "value", label: chart.metric }];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
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

        {series.map((item, index) => (
          <Line
            key={item.key}
            type="monotone"
            dataKey={item.key}
            name={item.label}
            stroke={["#38bdf8", "#a855f7", "#22c55e", "#f97316", "#ec4899"][index % 5]}
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}