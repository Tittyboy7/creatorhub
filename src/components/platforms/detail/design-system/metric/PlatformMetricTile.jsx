function getTrendStyles(trend) {
  if (!trend) {
    return {
      text: "text-zinc-500",
      background: "border-zinc-800 bg-zinc-900",
    };
  }

  if (trend.startsWith("-")) {
    return {
      text: "text-red-400",
      background: "border-red-500/20 bg-red-500/10",
    };
  }

  return {
    text: "text-green-400",
    background: "border-green-500/20 bg-green-500/10",
  };
}

export default function PlatformMetricTile({
  label,
  value,
  trend = null,
  detail = null,
  visualization = null,
  layout = "card",
  size = "default",
  className = "",
}) {
  const trendStyles = getTrendStyles(trend);

  const valueSize =
    size === "large"
      ? "text-2xl md:text-3xl"
      : size === "small"
        ? "text-lg"
        : "text-xl";

  if (layout === "row") {
    return (
      <div
        className={`border-t border-zinc-800 py-3 first:border-t-0 first:pt-0 ${className}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-zinc-500">{label}</p>

            <div className="mt-1 flex flex-wrap items-end gap-2">
              <p className={`font-bold text-white ${valueSize}`}>
                {value}
              </p>

              {trend && (
                <p className={`pb-0.5 text-xs font-semibold ${trendStyles.text}`}>
                  {trend}
                </p>
              )}
            </div>

            {detail && (
              <p className="mt-2 text-xs leading-5 text-zinc-500">
                {detail}
              </p>
            )}
          </div>

          {visualization && (
            <div className="w-24 shrink-0">
              {visualization}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-zinc-800 bg-zinc-950 p-4 ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-zinc-500">{label}</p>

          <p className={`mt-1 break-words font-bold text-white ${valueSize}`}>
            {value}
          </p>
        </div>

        {trend && (
          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${trendStyles.background} ${trendStyles.text}`}
          >
            {trend}
          </span>
        )}
      </div>

      {detail && (
        <p className="mt-3 text-sm leading-6 text-zinc-500">
          {detail}
        </p>
      )}

      {visualization && (
        <div className="mt-4">
          {visualization}
        </div>
      )}
    </div>
  );
}