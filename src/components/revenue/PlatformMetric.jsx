import MetricCard from "@/components/ui/MetricCard";

export default function PlatformMetric({ label, value }) {
  return (
    <MetricCard
      label={label}
      value={value}
      compact
      className="rounded-xl p-3"
    />
  );
}