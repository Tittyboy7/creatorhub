export default function AIInsightCard({ insight }) {
  const severityClass = getSeverityClass(insight?.severity);

  return (
    <div className={`rounded-2xl border bg-zinc-950/70 p-4 ${severityClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">
            {getSeverityIcon(insight?.severity)} {insight?.title}
          </p>

          {insight?.priority ? (
            <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-zinc-500">
              {insight.priority} priority
            </p>
          ) : null}
        </div>

        {insight?.category ? (
          <span className="shrink-0 rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-400">
            {formatCategory(insight.category)}
          </span>
        ) : null}
      </div>

      <p className="mt-2 text-sm leading-6 text-zinc-400">
        {insight?.summary}
      </p>
    </div>
  );
}

function getSeverityClass(severity) {
  if (severity === "success") return "border-emerald-500/30";
  if (severity === "warning") return "border-amber-500/30";
  if (severity === "error") return "border-red-500/30";
  return "border-zinc-800";
}

function getSeverityIcon(severity) {
  if (severity === "success") return "✅";
  if (severity === "warning") return "⚠️";
  if (severity === "error") return "🚨";
  return "💡";
}

function formatCategory(category) {
  return String(category).replaceAll("-", " ");
}