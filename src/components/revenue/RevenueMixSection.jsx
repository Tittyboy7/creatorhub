"use client";

import SummaryList from "@/components/ui/SummaryList";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { formatCurrency } from "@/lib/formatCurrency";
import EmptyState from "@/components/ui/EmptyState";

export default function RevenueMixSection({
  platformChartData = [],
  totalRevenue,
  chartColors = [],
}) {
  const visiblePlatformData = platformChartData
    .filter((platform) => Number(platform.revenue || 0) > 0)
    .sort((a, b) => Number(b.revenue || 0) - Number(a.revenue || 0));

  const visibleTotalRevenue = visiblePlatformData.reduce(
    (sum, platform) => sum + Number(platform.revenue || 0),
    0
  );

  const hasData = visiblePlatformData.length > 0 && visibleTotalRevenue > 0;

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
      {!hasData ? (
        <EmptyState
          title="No revenue mix yet"
          description="Add revenue entries or sync platforms with revenue data to see your income breakdown."
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
          <div className="h-72 min-h-72 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={visiblePlatformData}
                  dataKey="revenue"
                  nameKey="platform"
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={115}
                  paddingAngle={3}
                >
                  {visiblePlatformData.map((entry, index) => (
                    <Cell
                      key={entry.platform}
                      fill={chartColors[index % chartColors.length] || "#3b82f6"}
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    background: "#09090b",
                    border: "1px solid #27272a",
                    borderRadius: "14px",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <SummaryList
            items={visiblePlatformData}
            initialVisibleCount={3}
            getKey={(platform) => platform.platform}
            expandLabel="Show more revenue sources"
            collapseLabel="Show fewer revenue sources"
            renderItem={(platform, index) => {
              const percent = Math.round(
                (Number(platform.revenue || 0) / visibleTotalRevenue) * 100
              );

              return (
                <div
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor:
                            chartColors[index % chartColors.length] ||
                            "#3b82f6",
                        }}
                      />

                      <div>
                        <p className="font-semibold">{platform.platform}</p>
                        <p className="text-sm text-zinc-500">
                          {percent}% of tracked revenue
                        </p>
                      </div>
                    </div>

                    <p className="shrink-0 text-sm font-bold">
                      {formatCurrency(platform.revenue)}
                    </p>
                  </div>
                </div>
              );
            }}
          />
        </div>
      )}
    </section>
  );
}