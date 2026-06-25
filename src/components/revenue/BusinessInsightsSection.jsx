import Link from "next/link";

const priorityStyles = {
  high: "border-red-500/30 bg-red-500/10 text-red-300",
  medium: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  low: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
};

const trendStyles = {
  positive: "text-emerald-400",
  negative: "text-red-400",
  neutral: "text-zinc-400",
};

export default function BusinessInsightsSection({ insights = [] }) {
  if (!insights.length) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="mb-4">
        <p className="text-sm font-semibold text-zinc-300">
          Business Insights
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Clear recommendations based on your connected platform data.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {insights.map((insight) => (
          <div
            key={insight.title}
            className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-sm"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-lg">
                  {insight.icon || "📊"}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {insight.title}
                  </h3>
                  <p
                    className={`mt-1 text-xs capitalize ${
                      trendStyles[insight.trend] || trendStyles.neutral
                    }`}
                  >
                    {insight.trend || "neutral"} trend
                  </p>
                </div>
              </div>

              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${
                  priorityStyles[insight.priority] || priorityStyles.low
                }`}
              >
                {insight.priority || "low"}
              </span>
            </div>

            <p className="text-sm leading-6 text-zinc-400">
              {insight.description}
            </p>

            {insight.actionLabel && insight.actionHref && (
              <Link
                href={insight.actionHref}
                className="mt-4 inline-flex text-sm font-medium text-blue-400 hover:text-blue-300"
              >
                {insight.actionLabel} →
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}