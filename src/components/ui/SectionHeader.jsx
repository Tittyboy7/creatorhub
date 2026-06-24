import InfoTooltip from "@/components/revenue/InfoTooltip";

export default function SectionHeader({
  title,
  description,
  tooltip,
  action,
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {title}
          </h2>

          <InfoTooltip text={tooltip} />
        </div>

        {description && (
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-zinc-500">
            {description}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}