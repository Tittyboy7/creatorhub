import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
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

export default function ComparisonRevenueMix({ revenueComparisonData = [] }) {
  return (
    <div className="rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-5 shadow-2xl shadow-black/20">
      <div className="mb-4">
        <h3 className="text-lg font-bold">Revenue Mix</h3>
        <p className="mt-1 text-sm text-zinc-500">
          Share of tracked revenue by platform.
        </p>
      </div>

      {revenueComparisonData.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-700 p-8 text-center">
          <p className="text-sm text-zinc-400">No revenue mix available.</p>
        </div>
      ) : (
        <div className="h-72 rounded-3xl border border-zinc-800 bg-zinc-950/70 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
              <Pie
                data={revenueComparisonData}
                dataKey="revenue"
                nameKey="platform"
                innerRadius={60}
                outerRadius={95}
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
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}