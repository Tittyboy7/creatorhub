import Link from "next/link";

function OpportunityCard({ signal }) {
  const priorityStyles = {
    high: "border-red-500/30 bg-red-500/10 text-red-300",
    medium: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    low: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  };

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {signal.category}
        </p>

        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${
            priorityStyles[signal.severity] || priorityStyles.low
          }`}
        >
          {signal.severity}
        </span>
      </div>

      <h3 className="mt-3 text-xl font-bold">{signal.title}</h3>

      <div className="mt-3 space-y-3 text-sm leading-relaxed text-zinc-400">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Why this matters
          </p>
          <p className="mt-1">{signal.reason}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Recommendation
          </p>
          <p className="mt-1">{signal.recommendation}</p>
        </div>
      </div>

      {signal.action?.label && signal.action?.href && (
        <Link
          href={signal.action.href}
          className="mt-4 inline-flex rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm font-semibold text-white hover:border-zinc-700 hover:bg-zinc-900"
        >
          {signal.action.label} →
        </Link>
      )}
    </div>
  );
}

export default function RevenueOpportunitiesSection({ businessSignals = [] }) {
  const visibleSignals = businessSignals
    .filter((signal) =>
      ["growth", "risk", "opportunity", "stability"].includes(signal.category)
    )
    .slice(0, 4);

  if (!visibleSignals.length) {
    return (
      <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm font-semibold text-white">
            No major opportunities yet
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            As more revenue and platform data syncs in, CreatorsHub will surface
            clearer growth opportunities, risks, and next actions here.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
      <div className="grid gap-4 md:grid-cols-2">
        {visibleSignals.map((signal) => (
          <OpportunityCard key={signal.id} signal={signal} />
        ))}
      </div>
    </section>
  );
}