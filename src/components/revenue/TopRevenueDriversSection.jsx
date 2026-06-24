import { formatCurrency } from "@/lib/formatCurrency";
import MetricCard from "@/components/ui/MetricCard";

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

export default function TopRevenueDriversSection({
  platformChartData = [],
  revenueTypeChartData = [],
  entries = [],
}) {
  const topPlatform = getTopPlatform(platformChartData);
  const topRevenueType = getTopRevenueType(revenueTypeChartData);
  const largestEntry = getLargestEntry(entries);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="Top Platform"
        value={topPlatform?.platform || "No data yet"}
        subtitle={topPlatform ? formatCurrency(topPlatform.revenue) : "Sync or add revenue"}
        tooltip="The platform currently contributing the most tracked revenue."
      />

      <MetricCard
        label="Top Revenue Type"
        value={topRevenueType?.type || "No data yet"}
        subtitle={topRevenueType ? formatCurrency(topRevenueType.revenue) : "Add revenue categories"}
        tooltip="The revenue category currently making the most money, such as subscriptions, product sales, ads, or donations."
      />

      <MetricCard
        label="Largest Entry"
        value={largestEntry?.platform || largestEntry?.revenue_type || "No data yet"}
        subtitle={largestEntry ? formatCurrency(largestEntry.amount) : "Add or sync revenue entries"}
        tooltip="The single largest tracked revenue entry currently in your dashboard."
      />

      <MetricCard
        label="Revenue Sources"
        value={platformChartData.length}
        subtitle="Platforms with tracked data"
        tooltip="The number of platforms currently contributing tracked revenue data to this dashboard."
      />
    </div>
  );
}