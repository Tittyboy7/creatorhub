import { formatCurrency } from "@/lib/formatCurrency";

export default function RevenueTodaySection({
  totalRevenue,
  thisMonthRevenue,
  monthlyGrowthPercent,
  bestPlatform,
  topPlatformPercent,
  connectedPlatformCount,
  syncedEntriesCount,
}) {
  const growth = Number(monthlyGrowthPercent || 0);
  const platformName = bestPlatform?.platform || "your top platform";

  return (
    <section className="rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-4 md:p-5">
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">
            Today&apos;s Revenue Brief
          </p>

          <h2 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">
            Revenue is {formatGrowth(growth)} this month.
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Total tracked revenue is{" "}
            <span className="font-semibold text-white">
              {formatCurrency(totalRevenue)}
            </span>
            .
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Data Freshness
              </p>
              <p className="mt-1 text-sm text-zinc-300">
                {connectedPlatformCount || 0} connected ·{" "}
                {syncedEntriesCount || 0} synced entries
              </p>
            </div>

            <button
              type="button"
              className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-black hover:bg-zinc-200"
            >
              Sync Now
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <BriefPanel label="Total Revenue">
          <p className="text-4xl font-black tracking-tight text-white md:text-5xl">
            {formatCurrency(totalRevenue)}
          </p>

          <p className={growth >= 0 ? "mt-3 text-sm font-semibold text-emerald-400" : "mt-3 text-sm font-semibold text-red-400"}>
            {growth >= 0 ? "▲" : "▼"} {Math.abs(growth)}% this month
          </p>
        </BriefPanel>

        <BriefPanel label="What changed?">
          <h3 className="text-xl font-bold text-white">
            {formatChangeHeadline(growth)}
          </h3>

          <p className="mt-3 text-sm leading-6 text-zinc-400">
            You have tracked{" "}
            <span className="font-semibold text-white">
              {formatCurrency(thisMonthRevenue)}
            </span>{" "}
            this month. {platformName} is currently your strongest revenue
            source, contributing about {topPlatformPercent || 0}% of tracked
            revenue.
          </p>
        </BriefPanel>

        <div className="h-full rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
            Today&apos;s Priority
          </p>

          <h3 className="mt-3 text-xl font-bold text-white">
            {growth >= 0 ? "Find what caused the growth" : "Find where revenue changed"}
          </h3>

          <p className="mt-3 text-sm leading-6 text-zinc-300">
            {growth >= 0
              ? `${platformName} is leading your tracked revenue. Review the evidence below to identify what is carrying the strongest momentum.`
              : "Review the evidence below to see which platform or revenue type needs attention first."}
          </p>

          <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-black/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
              Next best step
            </p>

            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Open Revenue Mix or Top Revenue Drivers below to investigate the
              source of this change.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function BriefPanel({ label, children }) {
  return (
    <div className="h-full rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </p>

      <div className="mt-3">{children}</div>
    </div>
  );
}

function formatGrowth(value) {
  if (value > 0) return `up ${value}%`;
  if (value < 0) return `down ${Math.abs(value)}%`;
  return "unchanged";
}

function formatChangeHeadline(value) {
  if (value > 0) return "Revenue momentum is positive.";
  if (value < 0) return "Revenue momentum needs attention.";
  return "Revenue is holding steady.";
}