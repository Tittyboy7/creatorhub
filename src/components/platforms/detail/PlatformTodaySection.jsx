import Link from "next/link";

function parseTrendValue(trend) {
  if (!trend) return 0;

  const parsedValue = Number.parseFloat(
    String(trend).replace(/[^0-9.-]/g, "")
  );

  return Number.isFinite(parsedValue)
    ? parsedValue
    : 0;
}

function findSnapshotMetric(snapshot = [], keywords = []) {
  return snapshot.find((metric) => {
    const label = String(metric.label || "").toLowerCase();

    return keywords.some((keyword) =>
      label.includes(keyword)
    );
  });
}

function getAssessmentState({
  metric,
  positiveLabel,
  neutralLabel,
  negativeLabel,
}) {
  const trendValue = parseTrendValue(metric?.trend);

  if (trendValue > 0) {
    return {
      label: positiveLabel,
      description: metric
        ? `${metric.label} is up ${metric.trend.replace(
            /^\+/,
            ""
          )} compared with the previous period.`
        : "Performance is moving in a positive direction.",
      tone: "green",
      progress: 78,
    };
  }

  if (trendValue < 0) {
    return {
      label: negativeLabel,
      description: metric
        ? `${metric.label} is down ${Math.abs(
            trendValue
          )}% compared with the previous period.`
        : "Performance currently needs attention.",
      tone: "amber",
      progress: 42,
    };
  }

  return {
    label: neutralLabel,
    description:
      "Performance is stable compared with the previous period.",
    tone: "blue",
    progress: 60,
  };
}

function getToneStyles(tone) {
  const toneStyles = {
    green: {
      icon:
        "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
      value: "text-emerald-300",
      bar: "bg-emerald-400",
    },

    violet: {
      icon:
        "border-violet-500/25 bg-violet-500/10 text-violet-300",
      value: "text-violet-300",
      bar: "bg-violet-400",
    },

    blue: {
      icon:
        "border-blue-500/25 bg-blue-500/10 text-blue-300",
      value: "text-blue-300",
      bar: "bg-blue-400",
    },

    amber: {
      icon:
        "border-amber-500/25 bg-amber-500/10 text-amber-300",
      value: "text-amber-300",
      bar: "bg-amber-400",
    },
  };

  return toneStyles[tone] || toneStyles.blue;
}

function AssessmentCard({
  label,
  value,
  description,
  tone,
  icon,
  progress,
}) {
  const styles = getToneStyles(tone);

  return (
    <article className="rounded-2xl border border-zinc-800 bg-black/15 p-4">
      <div className="flex items-center gap-3">
        <span
          className={`
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            text-sm
            font-bold
            ${styles.icon}
          `}
        >
          {icon}
        </span>

        <p className="text-sm font-semibold text-zinc-200">
          {label}
        </p>
      </div>

      <p
        className={`mt-5 text-2xl font-bold tracking-tight ${styles.value}`}
      >
        {value}
      </p>

      <p className="mt-2 min-h-10 text-xs leading-5 text-zinc-500">
        {description}
      </p>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full ${styles.bar}`}
          style={{
            width: `${Math.max(
              8,
              Math.min(progress, 100)
            )}%`,
          }}
        />
      </div>
    </article>
  );
}

function BriefingColumn({
  eyebrow,
  title,
  description,
  tone,
}) {
  const styles = getToneStyles(tone);

  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <span
          className={`
            flex
            h-6
            w-6
            shrink-0
            items-center
            justify-center
            rounded-full
            border
            text-xs
            ${styles.icon}
          `}
        >
          ✓
        </span>

        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
          {eyebrow}
        </p>
      </div>

      <h3 className="mt-4 text-sm font-semibold leading-6 text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-zinc-500">
        {description}
      </p>
    </div>
  );
}

export default function PlatformTodaySection({
  platform,
  platformToday,
  brief,
}) {
  if (!platformToday || !brief) {
    return null;
  }

  const snapshot = platformToday.snapshot || [];

  const audienceMetric = findSnapshotMetric(snapshot, [
    "subscriber",
    "follower",
    "view",
  ]);

  const revenueMetric = findSnapshotMetric(snapshot, [
    "revenue",
    "sales",
    "earnings",
  ]);

  const audienceState = getAssessmentState({
    metric: audienceMetric,
    positiveLabel: "Growing",
    neutralLabel: "Stable",
    negativeLabel: "Declining",
  });

  const monetizationState = getAssessmentState({
    metric: revenueMetric,
    positiveLabel: "Improving",
    neutralLabel: "Stable",
    negativeLabel: "Needs Attention",
  });

  const isHealthy =
    platform?.status === "healthy";

  const confidenceScore =
    platformToday.confidence?.score || 0;

  const evidence =
    platformToday.evidence?.slice(0, 3) || [];

  return (
    <section
      id="platform-assessment"
      className="scroll-mt-24 space-y-5"
    >
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5 backdrop-blur md:p-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Platform intelligence
          </p>

          <h2 className="mt-1 text-xl font-bold text-white">
            Platform Assessment
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            A concise view of the platform’s current business health.
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-[repeat(4,minmax(0,1fr))_1.25fr]">
          <AssessmentCard
            label="Business Health"
            value={
              isHealthy
                ? "Healthy"
                : "Needs Attention"
            }
            description={
              isHealthy
                ? "The platform connection and current performance indicators are operating normally."
                : "One or more indicators require review before relying on the latest recommendations."
            }
            tone={isHealthy ? "green" : "amber"}
            icon="♡"
            progress={isHealthy ? 88 : 44}
          />

          <AssessmentCard
            label="Audience"
            value={audienceState.label}
            description={audienceState.description}
            tone={
              audienceState.tone === "green"
                ? "violet"
                : audienceState.tone
            }
            icon="◎"
            progress={audienceState.progress}
          />

          <AssessmentCard
            label="Monetization"
            value={monetizationState.label}
            description={
              monetizationState.description
            }
            tone={monetizationState.tone}
            icon="$"
            progress={monetizationState.progress}
          />

          <AssessmentCard
            label="Data Confidence"
            value={`${confidenceScore}%`}
            description={
              platformToday.confidence?.label ||
              "Confidence is based on coverage, freshness, and connection health."
            }
            tone="blue"
            icon="✓"
            progress={confidenceScore}
          />

          <article className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/15 via-violet-500/5 to-zinc-950 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-300">
              Recommended Focus
            </p>

            <p className="mt-4 text-lg font-semibold leading-7 text-white">
              {brief.recommendation}
            </p>

            {platformToday.priority?.action ? (
              <Link
                href={
                  platformToday.priority.action.href
                }
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-400"
              >
                {
                  platformToday.priority.action
                    .label
                }

                <span aria-hidden="true">→</span>
              </Link>
            ) : null}
          </article>
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5 backdrop-blur md:p-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            CreatorsHub briefing
          </p>

          <h2 className="mt-1 text-xl font-bold text-white">
            Executive Briefing
          </h2>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[repeat(3,minmax(0,1fr))_0.9fr]">
          <BriefingColumn
            eyebrow="What happened?"
            title={brief.whatHappened}
            description={
              "CreatorsHub identified this as the most important recent development on the platform."
            }
            tone="green"
          />

          <BriefingColumn
            eyebrow="Why does it matter?"
            title={brief.whyItMatters}
            description={
              "This explains how the change affects the creator’s broader platform performance."
            }
            tone="violet"
          />

          <BriefingColumn
            eyebrow="What should you do next?"
            title={brief.recommendation}
            description={
              "Focus on the recommended action while the supporting signals remain active."
            }
            tone="blue"
          />

          <div className="border-t border-zinc-800 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
              Key Reasons
            </p>

            <div className="mt-4 space-y-4">
              {evidence.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3"
                >
                  <span className="mt-1 text-emerald-400">
                    ✓
                  </span>

                  <p className="text-xs leading-5 text-zinc-400">
                    {item.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}