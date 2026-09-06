function formatPercent(value) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return Math.max(0, Math.min(100, value));
}

export default function AudienceOverviewCard({
  totalAudience,
  composition,
  subscriberGrowth,
  compact = false,
}) {
  const newViewerPercent = formatPercent(
    composition?.newViewerPercent
  );

  const returningViewerPercent = formatPercent(
    composition?.returningViewerPercent
  );

  const newViewerDegrees =
    newViewerPercent * 3.6;

  return (
    <article className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/20">
      <div
        className={`
          relative
          overflow-hidden
          border-b
          border-zinc-800
          bg-gradient-to-br
          from-violet-500/15
          via-zinc-950
          to-blue-500/10
          ${compact ? "p-5" : "p-6"}
        `}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.2),transparent_48%)]" />

        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-300">
            Audience Overview
          </p>

          <div
            className={`mt-5 flex ${
              compact
                ? "flex-col items-center"
                : "flex-col items-center gap-6 sm:flex-row sm:items-center"
            }`}
          >
            <div
              className={`relative flex shrink-0 items-center justify-center rounded-full ${
                compact
                  ? "h-36 w-36"
                  : "h-44 w-44"
              }`}
              style={{
                background: `conic-gradient(
                  #8b5cf6 0deg ${newViewerDegrees}deg,
                  #3b82f6 ${newViewerDegrees}deg 360deg
                )`,
              }}
            >
              <div
                className={`flex flex-col items-center justify-center rounded-full border border-zinc-800 bg-zinc-950 ${
                  compact
                    ? "h-[104px] w-[104px]"
                    : "h-[128px] w-[128px]"
                }`}
              >
                <p
                  className={`font-bold tracking-tight text-white ${
                    compact
                      ? "text-2xl"
                      : "text-3xl"
                  }`}
                >
                  {totalAudience}
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  Viewers
                </p>
              </div>
            </div>

            {!compact ? (
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-bold text-white">
                  Your audience is discovery-led
                </h3>

                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Most viewers reached during this period were discovering your channel for the first time.
                </p>

                {subscriberGrowth ? (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                    <span className="text-xs font-semibold text-emerald-300">
                      {subscriberGrowth.value} net subscribers
                    </span>

                    {subscriberGrowth.trend ? (
                      <span className="text-xs font-semibold text-emerald-400">
                        {subscriberGrowth.trend}
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className={compact ? "p-4" : "p-5"}>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />

              <p className="text-xs font-medium text-zinc-400">
                New viewers
              </p>
            </div>

            <p className="mt-2 text-2xl font-bold text-white">
              {newViewerPercent}%
            </p>
          </div>

          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />

              <p className="text-xs font-medium text-zinc-400">
                Returning
              </p>
            </div>

            <p className="mt-2 text-2xl font-bold text-white">
              {returningViewerPercent}%
            </p>
          </div>
        </div>

        {compact && subscriberGrowth ? (
          <div className="mt-3 flex items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
            <span className="text-xs text-zinc-500">
              Subscriber growth
            </span>

            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">
                {subscriberGrowth.value}
              </span>

              {subscriberGrowth.trend ? (
                <span className="text-xs font-semibold text-emerald-400">
                  {subscriberGrowth.trend}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}