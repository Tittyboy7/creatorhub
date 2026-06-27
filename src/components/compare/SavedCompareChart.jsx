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

export default function SavedCompareChart({ chart, data = [] }) {
  const hasData = data.length > 0;

  return (
    <div className="rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-5 shadow-2xl shadow-black/20">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Saved Chart
        </p>

        <h3 className="mt-2 text-lg font-bold capitalize">{chart.title}</h3>

        <p className="mt-1 text-sm text-zinc-500">
          {chart.chart_type} chart · {chart.metric} · {chart.time_period}
        </p>
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
                <XAxis dataKey="label" />
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
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                <Area type="monotone" dataKey="value" />
              </AreaChart>
            ) : (
              <BarChart data={data}>
                <XAxis dataKey="label" />
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