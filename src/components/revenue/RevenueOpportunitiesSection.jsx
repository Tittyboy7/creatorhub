import Link from "next/link";

function OpportunityCard({ signal, cause, featured = false }) {
  const priorityStyles = {
    high: "border-red-500/30 bg-red-500/10 text-red-300",
    medium: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    low: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  };

  return (
    <div
      className={`rounded-3xl border p-5 transition hover:border-zinc-700 ${
        featured
          ? "border-zinc-700 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black"
          : "border-zinc-800 bg-zinc-900"
      }`}
    >
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

      <h3 className={featured ? "mt-4 text-2xl font-bold" : "mt-3 text-xl font-bold"}>
        {signal.title}
      </h3>

      <div className="mt-4 grid gap-3 text-sm leading-relaxed text-zinc-400 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Why this matters
          </p>
          <p className="mt-2">{cause?.explanation || signal.reason}</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Recommendation
          </p>
          <p className="mt-2">{signal.recommendation}</p>
        </div>
      </div>

      {signal.action?.label && signal.action?.href && (
        <Link
          href={signal.action.href}
          className="mt-5 inline-flex rounded-2xl border border-zinc-700 bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-zinc-200"
        >
          {signal.action.label} →
        </Link>
      )}
    </div>
  );
}

export default function RevenueOpportunitiesSection({
  businessSignals = [],
  businessCauses = [],
}) {
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

  const [primarySignal, ...secondarySignals] = visibleSignals;

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
      <div className="space-y-4">
        <OpportunityCard
          signal={primarySignal}
          cause={businessCauses.find((cause) => cause.signalId === primarySignal.id)}
          featured
        />

        {secondarySignals.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            {secondarySignals.map((signal) => (
              <OpportunityCard
                key={signal.id}
                signal={signal}
                cause={businessCauses.find((cause) => cause.signalId === signal.id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}