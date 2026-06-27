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

export default function ComparisonRevenueChart({
  revenueComparisonData = [],
  selectedChartType,
  setSelectedChartType,
}) {
  return (
    <div className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold">Revenue by Platform</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Visual comparison based on the selected filters.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {["bar", "line", "pie", "area"].map((chartType) => (
            <button
              key={chartType}
              type="button"
              onClick={() => setSelectedChartType(chartType)}
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition-colors ${
                selectedChartType === chartType
                  ? "bg-white text-black"
                  : "border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              {chartType}
            </button>
          ))}
        </div>
      </div>

      {revenueComparisonData.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-700 p-8 text-center">
          <p className="text-sm text-zinc-400">
            No revenue data available for this filter.
          </p>
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {selectedChartType === "line" ? (
              <LineChart data={revenueComparisonData}>
                <XAxis dataKey="platform" />
                <YAxis />
                <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                <Line type="monotone" dataKey="revenue" strokeWidth={3} />
              </LineChart>
            ) : selectedChartType === "pie" ? (
              <PieChart>
                <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                <Pie
                  data={revenueComparisonData}
                  dataKey="revenue"
                  nameKey="platform"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={2}
                >
                  {revenueComparisonData.map((entry, index) => (
                    <Cell
                      key={entry.platform}
                      fill={
                        comparisonChartColors[
                          index % comparisonChartColors.length
                        ]
                      }
                    />
                  ))}
                </Pie>
              </PieChart>
            ) : selectedChartType === "area" ? (
              <AreaChart data={revenueComparisonData}>
                <XAxis dataKey="platform" />
                <YAxis />
                <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                <Area type="monotone" dataKey="revenue" />
              </AreaChart>
            ) : (
              <BarChart data={revenueComparisonData}>
                <XAxis dataKey="platform" />
                <YAxis />
                <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
                  {revenueComparisonData.map((entry, index) => (
                    <Cell
                      key={entry.platform}
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