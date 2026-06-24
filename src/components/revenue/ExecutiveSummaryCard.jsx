import InfoTooltip from "./InfoTooltip";

export default function ExecutiveSummaryCard({
  label,
  value,
  subtitle,
  tooltip,
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-zinc-500">{label}</p>
        <InfoTooltip text={tooltip} />
      </div>

      <p className="mt-3 text-3xl font-bold tracking-tight text-white">
        {value}
      </p>

      {subtitle && (
        <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>
      )}
    </div>
  );
}