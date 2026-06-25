import ExecutiveSummaryCard from "./ExecutiveSummaryCard";
import { formatCurrency } from "@/lib/formatCurrency";

export default function RevenueExecutiveSummary({
  totalRevenue,
  thisMonthRevenue,
  projectedNextMonthRevenue,
  monthlyGrowthPercent,
}) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <ExecutiveSummaryCard
        label="Total Revenue"
        value={formatCurrency(totalRevenue)}
        subtitle="All tracked creator income"
        tooltip="The total revenue currently tracked across your connected platforms and manual revenue entries."
      />

      <ExecutiveSummaryCard
        label="This Month"
        value={formatCurrency(thisMonthRevenue)}
        subtitle="Current month earnings"
        tooltip="Revenue tracked for the current calendar month."
      />

      <ExecutiveSummaryCard
        label="Projected Revenue"
        value={formatCurrency(projectedNextMonthRevenue)}
        subtitle="Estimated next month"
        tooltip="A simple estimate based on your recent revenue trend. This will become smarter as more platform data is synced."
      />

      <ExecutiveSummaryCard
        label="Monthly Growth"
        value={`${monthlyGrowthPercent}%`}
        trend={monthlyGrowthPercent}
        trendLabel="vs last month"
        tooltip="Shows whether your tracked revenue is increasing or decreasing compared with the previous month."
      />
    </section>
  );
}