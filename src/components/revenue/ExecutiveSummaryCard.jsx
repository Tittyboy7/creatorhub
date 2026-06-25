import MetricCard from "@/components/ui/MetricCard";

export default function ExecutiveSummaryCard({
  label,
  value,
  subtitle,
  tooltip,
  trend,
  trendLabel,
}) {
  return (
    <MetricCard
      label={label}
      value={value}
      subtitle={subtitle}
      tooltip={tooltip}
      trend={trend}
      trendLabel={trendLabel}
    />
  );
}