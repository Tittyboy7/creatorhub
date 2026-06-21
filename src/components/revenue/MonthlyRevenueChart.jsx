import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { formatMonth } from "@/lib/formatMonth";
import { formatCurrency } from "@/lib/formatCurrency";

const tooltipStyle = {
  backgroundColor: "#18181b",
  border: "1px solid #3f3f46",
  borderRadius: "16px",
  color: "#ffffff",
};

export default function MonthlyRevenueChart({
  chartType,
  setChartType,
  recentMonthlyChartData,
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Monthly Revenue</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Last 12 months of tracked revenue.
          </p>
        </div>

        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
          className="rounded-2xl border border-zinc-700 bg-zinc-800 px-4 py-3"
        >
          <option value="area">Area Chart</option>
          <option value="bar">Bar Chart</option>
          <option value="line">Line Chart</option>
        </select>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height={280}>
          {chartType === "bar" && (
            <BarChart data={recentMonthlyChartData}>
              <XAxis dataKey="month" stroke="#a1a1aa" tickFormatter={formatMonth} />
              <YAxis stroke="#a1a1aa" />
              <Tooltip
                formatter={(value) => [formatCurrency(value), "Revenue"]}
                contentStyle={tooltipStyle}
                labelStyle={{ color: "#ffffff" }}
              />
              <Bar dataKey="revenue" fill="#ffffff" radius={[8, 8, 0, 0]} />
            </BarChart>
          )}

          {chartType === "line" && (
            <LineChart data={recentMonthlyChartData}>
              <XAxis dataKey="month" stroke="#a1a1aa" tickFormatter={formatMonth} />
              <YAxis stroke="#a1a1aa" />
              <Tooltip
                formatter={(value) => [formatCurrency(value), "Revenue"]}
                contentStyle={tooltipStyle}
                labelStyle={{ color: "#ffffff" }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#ffffff" strokeWidth={3} />
            </LineChart>
          )}

          {chartType === "area" && (
            <AreaChart data={recentMonthlyChartData}>
              <XAxis dataKey="month" stroke="#a1a1aa" tickFormatter={formatMonth} />
              <YAxis stroke="#a1a1aa" />
              <Tooltip
                formatter={(value) => [formatCurrency(value), "Revenue"]}
                contentStyle={tooltipStyle}
                labelStyle={{ color: "#ffffff" }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#ffffff" fill="#ffffff" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}