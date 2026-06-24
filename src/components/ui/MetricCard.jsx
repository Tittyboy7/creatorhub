import CardShell from "./CardShell";
import InfoTooltip from "@/components/revenue/InfoTooltip";

export default function MetricCard({
  label,
  value,
  subtitle,
  tooltip,
  badge,
  className = "",
}) {
  return (
    <CardShell className={className}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-zinc-500">{label}</p>
        {tooltip && <InfoTooltip text={tooltip} />}
      </div>

      <p className="mt-3 truncate text-3xl font-bold tracking-tight text-white">
        {value}
      </p>

      <div className="mt-2 flex items-center justify-between gap-3">
        {subtitle && <p className="truncate text-sm text-zinc-400">{subtitle}</p>}

        {badge && (
          <span className="shrink-0 rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
            {badge}
          </span>
        )}
      </div>
    </CardShell>
  );
}