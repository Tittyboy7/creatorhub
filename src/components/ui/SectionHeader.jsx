import InfoTooltip from "@/components/revenue/InfoTooltip";
import IconBadge from "@/components/ui/IconBadge";

export default function SectionHeader({
  title,
  description,
  tooltip,
  action,
  icon,
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div className="flex items-start gap-4">
        {icon && <IconBadge icon={icon} label={title} />}

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
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}