import Link from "next/link";

function getPriorityStyles(severity) {
  if (severity === "high") {
    return {
      container: "border-amber-500/30 bg-amber-500/10",
      eyebrow: "text-amber-300",
      impact: "border-amber-500/20 bg-amber-500/10 text-amber-200",
    };
  }

  if (severity === "medium") {
    return {
      container: "border-blue-500/30 bg-blue-500/10",
      eyebrow: "text-blue-300",
      impact: "border-blue-500/20 bg-blue-500/10 text-blue-200",
    };
  }

  return {
    container: "border-green-500/30 bg-green-500/10",
    eyebrow: "text-green-300",
    impact: "border-green-500/20 bg-green-500/10 text-green-200",
  };
}

function getImportanceClass(importance) {
  if (importance === "high") {
    return "bg-red-400";
  }

  if (importance === "medium") {
    return "bg-amber-400";
  }

  return "bg-zinc-600";
}

function getTrendClass(trend) {
  if (!trend) {
    return "text-zinc-500";
  }

  if (trend.startsWith("-")) {
    return "text-red-400";
  }

  return "text-green-400";
}

function PrioritySection({ priority }) {
  const styles = getPriorityStyles(priority.severity);

  return (
    <div className={`rounded-3xl border p-5 md:p-6 ${styles.container}`}>
      <p
        className={`text-xs font-semibold uppercase tracking-wide ${styles.eyebrow}`}
      >
        {priority.eyebrow}
      </p>

      <div className="mt-3 max-w-3xl">
        <h2 className="text-2xl font-bold leading-tight text-white md:text-3xl">
          {priority.title}
        </h2>

        <p className="mt-3 text-sm leading-6 text-zinc-300">
          {priority.explanation}
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Estimated Impact
          </p>

          <span
            className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${styles.impact}`}
          >
            {priority.impact}
          </span>
        </div>

        {priority.action && (
          <Link
            href={priority.action.href}
            className="inline-flex w-fit shrink-0 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            {priority.action.label}
            <span aria-hidden="true" className="ml-2">
              →
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}

function ConfidenceSection({ confidence }) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Platform Data Confidence
      </p>

      <div className="mt-3 flex items-end gap-3">
        <p className="text-4xl font-bold text-white">{confidence.score}</p>

        <p className="pb-1 text-sm font-semibold text-zinc-300">
          {confidence.label}
        </p>
      </div>

      <div className="mt-5 space-y-3">
        <ConfidenceRow
          label="Connection status"
          value={confidence.connectionStatus}
        />

        <ConfidenceRow
          label="Metric coverage"
          value={confidence.metricCoverage}
        />

        <ConfidenceRow
          label="Data freshness"
          value={confidence.freshness}
        />
      </div>
    </div>
  );
}

function ConfidenceRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-zinc-800 pt-3 first:border-t-0 first:pt-0">
      <p className="text-sm text-zinc-500">{label}</p>

      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function EvidenceSection({ evidence }) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Supporting Evidence
      </p>

      <div className="mt-4 space-y-4">
        {evidence.map((item) => (
          <div key={item.id} className="flex gap-3">
            <span
              className={`mt-2 h-2 w-2 shrink-0 rounded-full ${getImportanceClass(
                item.importance
              )}`}
            />

            <div>
              <p className="text-sm font-semibold text-white">{item.title}</p>

              <p className="mt-1 text-sm leading-6 text-zinc-400">
                {item.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SnapshotSection({ snapshot }) {
  return (
    <div
      id="platform-performance"
      className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Platform Snapshot
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {snapshot.map((metric) => (
          <div
            key={metric.id}
            className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3"
          >
            <p className="text-xs text-zinc-500">{metric.label}</p>

            <div className="mt-1 flex items-center gap-3">
              <p className="text-lg font-bold text-white">{metric.value}</p>

              {metric.trend && (
                <p
                  className={`text-xs font-semibold ${getTrendClass(
                    metric.trend
                  )}`}
                >
                  {metric.trend}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PlatformTodaySection({ platformToday }) {
  if (!platformToday) {
    return null;
  }

  return (
    <section className="space-y-5">
      <PrioritySection priority={platformToday.priority} />

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <ConfidenceSection confidence={platformToday.confidence} />
        </div>

        <div className="lg:col-span-8">
          <EvidenceSection evidence={platformToday.evidence} />
        </div>
      </div>

      <SnapshotSection snapshot={platformToday.snapshot} />
    </section>
  );
}