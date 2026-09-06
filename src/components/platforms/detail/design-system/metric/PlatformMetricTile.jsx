function getTrendStyles(trend) {
  if (!trend) {
    return {
      text: "text-zinc-500",
      background: "border-zinc-800 bg-zinc-900",
      symbol: "",
    };
  }

  if (
    trend.startsWith("-") ||
    trend.startsWith("↓")
  ) {
    return {
      text: "text-red-400",
      background:
        "border-red-500/20 bg-red-500/10",
      symbol: "↘",
    };
  }

  return {
    text: "text-emerald-400",
    background:
      "border-emerald-500/20 bg-emerald-500/10",
    symbol: "↗",
  };
}

function formatTrend(trend) {
  if (!trend) return "";

  return String(trend).replace(/^[↑↓]/, "");
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
      <article
        className={`
          group
          border-t
          border-zinc-800/80
          py-4
          first:border-t-0
          first:pt-0
          ${className}
        `}
      >
        <div className="flex items-center justify-between gap-5">
          <div className="min-w-0">
            <p className="text-xs font-medium text-zinc-500">
              {label}
            </p>

            <div className="mt-1 flex flex-wrap items-end gap-2">
              <p
                className={`font-bold tracking-tight text-white ${valueSize}`}
              >
                {value}
              </p>

              {trend ? (
                <p
                  className={`pb-0.5 text-xs font-semibold ${trendStyles.text}`}
                >
                  {trendStyles.symbol}{" "}
                  {formatTrend(trend)}
                </p>
              ) : null}
            </div>

            {detail ? (
              <p className="mt-2 text-xs leading-5 text-zinc-500">
                {detail}
              </p>
            ) : null}
          </div>

          {visualization ? (
            <div className="w-28 shrink-0 opacity-90 transition group-hover:opacity-100">
              {visualization}
            </div>
          ) : null}
        </div>
      </article>
    );
  }

  return (
    <article
      className={`
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        border-zinc-800
        bg-black/15
        p-4
        transition
        duration-300
        hover:-translate-y-0.5
        hover:border-zinc-700
        hover:bg-zinc-900/80
        ${className}
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-zinc-500">
            {label}
          </p>

          <p
            className={`mt-1 break-words font-bold tracking-tight text-white ${valueSize}`}
          >
            {value}
          </p>
        </div>

        {trend ? (
          <span
            className={`
              inline-flex
              shrink-0
              items-center
              gap-1
              rounded-full
              border
              px-2.5
              py-1
              text-xs
              font-semibold
              ${trendStyles.background}
              ${trendStyles.text}
            `}
          >
            <span aria-hidden="true">
              {trendStyles.symbol}
            </span>

            {formatTrend(trend)}
          </span>
        ) : null}
      </div>

      {visualization ? (
        <div className="mt-4 border-t border-zinc-800/70 pt-3 opacity-90 transition group-hover:opacity-100">
          {visualization}
        </div>
      ) : null}

      {detail ? (
        <p className="mt-3 text-xs leading-5 text-zinc-500">
          {detail}
        </p>
      ) : null}
    </article>
  );
}