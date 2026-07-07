import Link from "next/link";
import SummaryList from "@/components/ui/SummaryList";

function getPriorityClass(severity) {
  if (severity === "high") return "border-red-500/30 bg-red-500/10 text-red-300";
  if (severity === "medium")
    return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
}

function SignalRow({ signal, cause }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-white">{signal.title}</p>

            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${getPriorityClass(
                signal.severity
              )}`}
            >
              {signal.severity}
            </span>
          </div>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {cause?.explanation || signal.reason}
          </p>
        </div>

        {signal.action?.label && signal.action?.href ? (
          <Link
            href={signal.action.href}
            className="shrink-0 rounded-xl border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            {signal.action.label} →
          </Link>
        ) : null}
      </div>
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
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
        <p className="text-sm font-semibold text-white">
          No major opportunities yet
        </p>

        <p className="mt-2 text-sm text-zinc-400">
          As more revenue and platform data syncs in, CreatorsHub will surface
          clearer growth opportunities, risks, and next actions here.
        </p>
      </section>
    );
  }

  const [primarySignal, ...secondarySignals] = visibleSignals;
  const primaryCause = businessCauses.find(
    (cause) => cause.signalId === primarySignal.id
  );

  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-zinc-700 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Primary Focus
            </p>

            <h3 className="mt-2 text-2xl font-bold text-white">
              {primarySignal.title}
            </h3>
          </div>

          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold uppercase ${getPriorityClass(
              primarySignal.severity
            )}`}
          >
            {primarySignal.severity}
          </span>
        </div>

        <p className="mt-4 text-sm leading-6 text-zinc-400">
          {primaryCause?.explanation || primarySignal.reason}
        </p>

        <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Next best step
          </p>

          <p className="mt-2 text-sm leading-6 text-zinc-300">
            {primarySignal.recommendation}
          </p>
        </div>

        {primarySignal.action?.label && primarySignal.action?.href ? (
          <Link
            href={primarySignal.action.href}
            className="mt-5 inline-flex rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-zinc-200"
          >
            {primarySignal.action.label} →
          </Link>
        ) : null}
      </div>

      {secondarySignals.length > 0 ? (
        <SummaryList
          items={secondarySignals}
          initialVisibleCount={1}
          getKey={(signal) => signal.id}
          expandLabel="Show more signals"
          collapseLabel="Show fewer signals"
          renderItem={(signal) => (
            <SignalRow
              signal={signal}
              cause={businessCauses.find((cause) => cause.signalId === signal.id)}
            />
          )}
        />
      ) : null}
    </section>
  );
}