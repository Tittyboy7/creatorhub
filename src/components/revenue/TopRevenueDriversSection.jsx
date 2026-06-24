import InfoTooltip from "./InfoTooltip";
import { formatCurrency } from "@/lib/formatCurrency";

function getTopPlatform(platformChartData = []) {
  return [...platformChartData]
    .filter((platform) => Number(platform.revenue || 0) > 0)
    .sort((a, b) => Number(b.revenue || 0) - Number(a.revenue || 0))[0];
}

function getTopRevenueType(revenueTypeChartData = []) {
  return [...revenueTypeChartData]
    .filter((type) => Number(type.revenue || 0) > 0)
    .sort((a, b) => Number(b.revenue || 0) - Number(a.revenue || 0))[0];
}

function getLargestEntry(entries = []) {
  return [...entries]
    .filter((entry) => Number(entry.amount || 0) > 0)
    .sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))[0];
}

function DriverCard({ label, value, subtitle, tooltip }) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-zinc-500">{label}</p>
        <InfoTooltip text={tooltip} />
      </div>

      <p className="mt-3 text-2xl font-bold text-white">{value}</p>

      {subtitle && <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>}
    </div>
  );
}

export default function TopRevenueDriversSection({
  platformChartData = [],
  revenueTypeChartData = [],
  entries = [],
  monthlyGrowthPercent = 0,
}) {
  const topPlatform = getTopPlatform(platformChartData);
  const topRevenueType = getTopRevenueType(revenueTypeChartData);
  const largestEntry = getLargestEntry(entries);

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DriverCard
          label="Top Platform"
          value={topPlatform?.platform || "No data yet"}
          subtitle={
            topPlatform ? formatCurrency(topPlatform.revenue) : "Sync or add revenue"
          }
          tooltip="The platform currently contributing the most tracked revenue."
        />

        <DriverCard
          label="Top Revenue Type"
          value={topRevenueType?.type || "No data yet"}
          subtitle={
            topRevenueType
              ? formatCurrency(topRevenueType.revenue)
              : "Add revenue categories"
          }
          tooltip="The revenue category currently making the most money, such as subscriptions, product sales, ads, or donations."
        />

        <DriverCard
          label="Largest Entry"
          value={
            largestEntry?.platform ||
            largestEntry?.revenue_type ||
            "No data yet"
          }
          subtitle={
            largestEntry
              ? formatCurrency(largestEntry.amount)
              : "Add or sync revenue entries"
          }
          tooltip="The single largest tracked revenue entry currently in your dashboard."
        />

        <DriverCard
          label="Revenue Sources"
          value={platformChartData.length}
          subtitle="Platforms with tracked data"
          tooltip="The number of platforms currently contributing tracked revenue data to this dashboard."
        />
      </div>
    </section>
  );
}