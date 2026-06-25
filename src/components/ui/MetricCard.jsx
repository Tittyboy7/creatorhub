import CardShell from "./CardShell";
import InfoTooltip from "@/components/revenue/InfoTooltip";
import StatTrend from "./StatTrend";

export default function MetricCard({
  label,
  value,
  subtitle,
  tooltip,
  badge,
  trend,
  trendLabel,
  className = "",
  valueClassName = "",
  compact = false,
}) {
  return (
    <CardShell className={className}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {label}
        </p>

        {tooltip && <InfoTooltip text={tooltip} />}
      </div>

      <p
        className={`mt-2 truncate font-bold tracking-tight text-white ${
          compact ? "text-xl" : "text-3xl"
        } ${valueClassName}`}
      >
        {value}
      </p>

      {trend !== undefined && (
        <StatTrend value={trend} label={trendLabel} />
      )}

      {(subtitle || badge) && (
        <div className="mt-3 flex items-center justify-between gap-3">
          {subtitle ? (
            <p className="truncate text-sm text-zinc-400">{subtitle}</p>
          ) : (
            <span />
          )}

          {badge && (
            <span className="shrink-0 rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
              {badge}
            </span>
          )}
        </div>
      )}
    </CardShell>
  );
}