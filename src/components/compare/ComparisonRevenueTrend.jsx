import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function ComparisonRevenueTrend({ revenueTrendData = [] }) {
  return (
    <div className="rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-5 shadow-2xl shadow-black/20">
      <div className="mb-4">
        <h3 className="text-lg font-bold">Revenue Trend</h3>
        <p className="mt-1 text-sm text-zinc-500">
          Tracked revenue over time.
        </p>
      </div>

      {revenueTrendData.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-700 p-8 text-center">
          <p className="text-sm text-zinc-400">No revenue trend available.</p>
        </div>
      ) : (
        <div className="h-72 rounded-3xl border border-zinc-800 bg-zinc-950/70 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrendData}>
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
              <Area type="monotone" dataKey="revenue" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}