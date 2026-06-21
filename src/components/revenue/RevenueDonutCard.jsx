import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

import { formatCurrency } from "@/lib/formatCurrency";

const tooltipStyle = {
  backgroundColor: "#18181b",
  border: "1px solid #3f3f46",
  borderRadius: "16px",
  color: "#ffffff",
};

export default function RevenueDonutCard({
  title,
  description,
  data,
  nameKey,
  totalRevenue,
  chartColors,
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      </div>

      {data.length === 0 ? (
        <p className="text-zinc-400">No chart data yet.</p>
      ) : (
        <div className="grid gap-4">
          <div className="flex justify-center">
            <PieChart width={220} height={220}>
              <Pie
                data={data}
                dataKey="revenue"
                nameKey={nameKey}
                innerRadius={62}
                outerRadius={92}
                paddingAngle={3}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry[nameKey]}
                    fill={chartColors[index % chartColors.length]}
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(value) => [formatCurrency(value), "Revenue"]}
                contentStyle={tooltipStyle}
                labelStyle={{ color: "#ffffff" }}
              />
            </PieChart>
          </div>

          <div className="min-w-0 space-y-2">
            {data.slice(0, 5).map((item, index) => {
              const label = item[nameKey];

              const percent =
                totalRevenue === 0
                  ? 0
                  : Math.round((item.revenue / totalRevenue) * 100);

              return (
                <div
                  key={label}
                  className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          chartColors[index % chartColors.length],
                      }}
                    />

                    <div className="min-w-0">
                      <p className="truncate font-semibold">{label}</p>
                      <p className="text-xs text-zinc-500">
                        {percent}% of revenue
                      </p>
                    </div>
                  </div>

                  <p className="shrink-0 text-right text-xs font-semibold text-zinc-300">
                    {formatCurrency(item.revenue)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}