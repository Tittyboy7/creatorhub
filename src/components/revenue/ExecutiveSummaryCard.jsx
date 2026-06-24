import MetricCard from "@/components/ui/MetricCard";

export default function ExecutiveSummaryCard({
  label,
  value,
  subtitle,
  tooltip,
}) {
  return (
    <MetricCard
      label={label}
      value={value}
      subtitle={subtitle}
      tooltip={tooltip}
    />
  );
}