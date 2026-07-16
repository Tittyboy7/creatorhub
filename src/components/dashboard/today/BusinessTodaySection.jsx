import Link from "next/link";

export default function BusinessTodaySection({
  businessToday,
}) {
  const priority = businessToday?.priority || {};
  const confidence = businessToday?.confidence || {};
  const evidence = Array.isArray(businessToday?.evidence)
    ? businessToday.evidence
    : [];
  const snapshot = Array.isArray(businessToday?.snapshot)
    ? businessToday.snapshot
    : [];

  return (
    <section className="overflow-hidden rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
      <div className="border-b border-zinc-800 px-5 py-4 md:px-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">
          Business Today
        </p>

        <h2 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">
          Here&apos;s what needs your attention.
        </h2>
      </div>

      <div className="border-b border-zinc-800 bg-emerald-500/5 px-5 py-6 md:px-7 md:py-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
          {priority.eyebrow || "Today’s Priority"}
        </p>

        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h3 className="text-2xl font-black tracking-tight text-white md:text-3xl">
              {priority.title ||
                "Build a stronger business data foundation"}
            </h3>

            <p className="mt-3 text-sm leading-6 text-zinc-300 md:text-base">
              {priority.explanation ||
                "Connect platforms and track your business consistently so CreatorsHub can identify stronger risks and opportunities."}
            </p>
          </div>

          <Link
            href={priority.action?.href || "/connected-accounts"}
            className="inline-flex w-fit shrink-0 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:border-emerald-300/50 hover:bg-emerald-400/15 hover:text-white"
          >
            {priority.action?.label || "Review Connected Accounts"} →
          </Link>
        </div>
      </div>

      <div className="grid divide-y divide-zinc-800 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
        <div className="bg-zinc-950/40 p-5 md:p-6">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Business Confidence
            </p>

            <ConfidenceTooltip />
          </div>

          <p className="mt-3 text-5xl font-black text-white">
            {Number(confidence.score || 0)}
          </p>

          <p
            className={`mt-2 text-sm font-semibold ${getConfidenceTextClass(
              confidence.label
            )}`}
          >
            {confidence.label || "Low confidence"}
          </p>

          <div className="mt-5 space-y-2 border-t border-zinc-800 pt-4">
            <DetailRow
              label="Data confidence"
              value={confidence.dataConfidence || "Limited"}
            />

            <DetailRow
              label="Healthy connections"
              value={`${Number(
                confidence.healthyConnections || 0
              )}/${Number(confidence.connectedAccounts || 0)}`}
            />

            <DetailRow
              label="Business coverage"
              value={confidence.businessCoverage || "Limited"}
            />
          </div>
        </div>

        <div className="bg-zinc-950/40 p-5 md:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Supporting Evidence
          </p>

          <div className="mt-4 space-y-3">
            {evidence.length > 0 ? (
              evidence.map((item) => (
                <EvidenceItem
                  key={item.id}
                  text={item.text}
                  importance={item.importance}
                />
              ))
            ) : (
              <p className="text-sm leading-6 text-zinc-400">
                CreatorsHub is still gathering enough information to
                support today&apos;s recommendation.
              </p>
            )}
          </div>
        </div>

        <div className="bg-zinc-950/40 p-5 md:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Business Snapshot
          </p>

          <div className="mt-4 divide-y divide-zinc-800">
            {snapshot.map((item) => (
              <SnapshotRow
                key={item.id}
                label={item.label}
                value={item.value}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ConfidenceTooltip() {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label="What is Business Confidence?"
        className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-700 text-[11px] font-bold text-zinc-400 transition hover:border-zinc-500 hover:text-white"
      >
        i
      </button>

      <span className="pointer-events-none absolute left-1/2 top-7 z-20 hidden w-72 -translate-x-1/2 rounded-2xl border border-zinc-700 bg-zinc-900 p-4 text-left shadow-2xl group-hover:block group-focus-within:block">
        <span className="block text-sm font-semibold text-white">
          Business Confidence
        </span>

        <span className="mt-2 block text-xs leading-5 text-zinc-400">
          Shows how much CreatorsHub can trust today&apos;s analysis
          based on data coverage, connection health, and data
          reliability. It does not rate the health of your business.
        </span>
      </span>
    </span>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 text-xs">
      <span className="text-zinc-500">{label}</span>
      <span className="font-semibold text-zinc-300">{value}</span>
    </div>
  );
}

function EvidenceItem({ text, importance = "low" }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-zinc-800 bg-black/20 px-4 py-3">
      <span
        className="mt-1 inline-block h-2.5 min-h-2.5 w-2.5 min-w-2.5 shrink-0 rounded-full"
        style={{
          backgroundColor: getImportanceColor(importance),
          boxShadow: `0 0 10px ${getImportanceGlow(importance)}`,
        }}
      />

      <p className="text-sm leading-6 text-zinc-300">
        {text}
      </p>
    </div>
  );
}

function SnapshotRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-5 py-3 first:pt-0 last:pb-0">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="text-right text-sm font-bold text-white">
        {value}
      </span>
    </div>
  );
}

function getConfidenceTextClass(label) {
  if (label === "High confidence") {
    return "text-emerald-400";
  }

  if (label === "Good confidence") {
    return "text-blue-400";
  }

  if (label === "Needs attention") {
    return "text-amber-400";
  }

  if (label === "Limited confidence") {
    return "text-zinc-400";
  }

  return "text-zinc-500";
}

function getImportanceColor(importance) {
  if (importance === "high") return "#34d399";
  if (importance === "medium") return "#60a5fa";
  return "#71717a";
}

function getImportanceGlow(importance) {
  if (importance === "high") {
    return "rgba(52, 211, 153, 0.7)";
  }

  if (importance === "medium") {
    return "rgba(96, 165, 250, 0.55)";
  }

  return "rgba(113, 113, 122, 0.35)";
}