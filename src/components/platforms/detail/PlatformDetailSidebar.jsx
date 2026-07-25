import Link from "next/link";
import { getPlatform } from "@/lib/platforms";

function getPriorityStyles(severity) {
  if (severity === "high") {
    return {
      icon: "border-amber-500/30 bg-amber-500/10 text-amber-300",
      accent: "text-amber-300",
    };
  }

  if (severity === "medium") {
    return {
      icon: "border-violet-500/30 bg-violet-500/10 text-violet-300",
      accent: "text-violet-300",
    };
  }

  return {
    icon: "border-green-500/30 bg-green-500/10 text-green-300",
    accent: "text-green-300",
  };
}

function getConfidenceBarCount(score) {
  if (score >= 90) return 5;
  if (score >= 75) return 4;
  if (score >= 55) return 3;
  if (score >= 35) return 2;

  return 1;
}

function ConfidenceBars({ score }) {
  const activeBars = getConfidenceBarCount(score);

  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          className={`h-4 w-7 rounded ${
            index < activeBars ? "bg-green-500" : "bg-zinc-800"
          }`}
        />
      ))}
    </div>
  );
}

function EvidenceItem({ item }) {
  const isPositive = item.importance !== "high";

  return (
    <div className="flex items-start gap-3">
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${
          isPositive
            ? "border-green-500/30 bg-green-500/10 text-green-400"
            : "border-amber-500/30 bg-amber-500/10 text-amber-300"
        }`}
      >
        {isPositive ? "✓" : "!"}
      </span>

      <div className="min-w-0">
        <p className="text-sm font-medium leading-5 text-zinc-200">
          {item.title}
        </p>

        {item.detail && (
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            {item.detail}
          </p>
        )}
      </div>
    </div>
  );
}

function SidebarSection({ title, children }) {
  return (
    <div className="border-t border-zinc-800 px-5 py-5 first:border-t-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {title}
      </p>

      <div className="mt-4">{children}</div>
    </div>
  );
}

export default function PlatformDetailSidebar({
  platform,
  platformToday,
}) {
  const platformConfig = getPlatform(platform.key);
  const priority = platformToday.priority;
  const confidence = platformToday.confidence;
  const evidence = platformToday.evidence;
  const priorityStyles = getPriorityStyles(priority.severity);

  const externalDashboard =
    platform.externalDashboard || platformConfig?.externalDashboard;

  return (
    <aside className="space-y-5">
      <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">
        <SidebarSection title="Today’s Priority">
          <div className="flex items-start gap-3">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-lg ${priorityStyles.icon}`}
            >
              ✦
            </span>

            <div className="min-w-0">
              <h2 className="text-base font-bold leading-6 text-white">
                {priority.title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {priority.explanation}
              </p>
            </div>
          </div>

          {priority.action && (
            <Link
              href={priority.action.href}
              className="mt-4 inline-flex w-full items-center justify-between rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:border-zinc-600 hover:bg-zinc-800"
            >
              View Recommendation
              <span aria-hidden="true">→</span>
            </Link>
          )}
        </SidebarSection>

        <SidebarSection title="Data Confidence">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white">
                {confidence.label}
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Based on connection health, coverage, and freshness.
              </p>
            </div>

            <p className={`text-2xl font-bold ${priorityStyles.accent}`}>
              {confidence.score}%
            </p>
          </div>

          <div className="mt-4">
            <ConfidenceBars score={confidence.score} />
          </div>
        </SidebarSection>

        <SidebarSection title="Key Evidence">
          <div className="space-y-4">
            {evidence.slice(0, 3).map((item) => (
              <EvidenceItem key={item.id} item={item} />
            ))}
          </div>
        </SidebarSection>
      </div>

      <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">
        <SidebarSection title="Quick Actions">
          <div className="space-y-2">
            {externalDashboard?.href && (
              <a
                href={externalDashboard.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
              >
                <span>Open {platform.name} Dashboard</span>
                <span aria-hidden="true">↗</span>
              </a>
            )}

            <button
              type="button"
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
            >
              <span>Review Content Ideas</span>
              <span aria-hidden="true">→</span>
            </button>

            <button
              type="button"
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
            >
              <span>Analyze Content</span>
              <span aria-hidden="true">→</span>
            </button>

            <Link
              href={`/connected-accounts/${platform.key}`}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
            >
              <span>Connection Settings</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </SidebarSection>
      </div>

      <div className="rounded-3xl border border-violet-500/20 bg-gradient-to-b from-violet-500/10 to-zinc-900 p-5">
        <div className="flex items-center gap-2">
          <span className="text-xl text-violet-300">✦</span>

          <h2 className="font-bold text-white">Need help growing?</h2>
        </div>

        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Get personalized guidance from your CreatorsHub AI business coach.
        </p>

        <button
          type="button"
          className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-violet-500/40 bg-violet-500/10 px-4 py-3 text-sm font-semibold text-violet-200 transition hover:bg-violet-500/20"
        >
          Ask AI Coach
          <span aria-hidden="true" className="ml-2">
            ✦
          </span>
        </button>
      </div>
    </aside>
  );
}