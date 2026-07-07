import { formatCurrency } from "@/lib/formatCurrency";

export default function RevenueTodaySection({
  totalRevenue,
  monthlyGrowthPercent,
  connectedPlatformCount,
  syncing,
  onSyncAll,
  brief,
}) {
  const growth = Number(monthlyGrowthPercent || 0);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
      <div className="border-b border-zinc-800 px-5 py-4 md:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">
              Revenue Today
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">
              {brief?.headline || "Here&apos;s what changed since your last visit."}
            </h2>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Data Status
              </p>

              <p className="mt-1 text-sm text-zinc-300">
                {connectedPlatformCount || 0} connected platforms
              </p>
            </div>

            <button
              type="button"
              onClick={onSyncAll}
              disabled={syncing}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {syncing ? "Syncing..." : "Sync Now"}
            </button>
          </div>
        </div>
      </div>

      <div
        className="grid divide-y divide-zinc-800 md:divide-x md:divide-y-0"
        style={{
          gridTemplateColumns: "0.85fr 1.35fr 1fr",
        }}
      >
        <BriefColumn label="Lifetime Revenue">
          <p className="text-4xl font-black tracking-tight text-white md:text-5xl">
            {formatCurrency(totalRevenue)}
          </p>

          <p
            className={
              growth >= 0
                ? "mt-3 text-sm font-semibold text-emerald-400"
                : "mt-3 text-sm font-semibold text-red-400"
            }
          >
            {growth >= 0 ? "▲" : "▼"} {Math.abs(growth)}% this month
          </p>
        </BriefColumn>

        <BriefColumn label="Since Your Last Visit">
          <div className="space-y-3">
            {(brief?.changes || []).map((change, index) => (
              <BriefItem
                key={`${change.type}-${index}`}
                label={change.title}
                detail={change.detail}
              />
            ))}
          </div>
        </BriefColumn>

        <BriefColumn label="Recommended Focus" highlight>
          <h3 className="text-xl font-bold text-white">
            {brief?.recommendation?.title || "Review your revenue focus"}
          </h3>

          <p className="mt-3 text-sm leading-6 text-zinc-300">
            {brief?.recommendation?.description ||
              "Review the evidence below to decide what deserves your attention next."}
          </p>

          <div className="mt-4 border-t border-emerald-500/20 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
              Suggested action
            </p>

            <p className="mt-2 text-sm leading-6 text-emerald-100">
              Open Revenue Mix or Top Revenue Drivers below to investigate the source of this change.
            </p>
          </div>
        </BriefColumn>
      </div>
    </section>
  );
}

function BriefColumn({ label, children, highlight = false }) {
  return (
    <div
      className={
        highlight
          ? "bg-emerald-500/5 p-5 md:p-6"
          : "bg-zinc-950/40 p-5 md:p-6"
      }
    >
      <p
        className={
          highlight
            ? "text-xs font-semibold uppercase tracking-wide text-emerald-300"
            : "text-xs font-semibold uppercase tracking-wide text-zinc-500"
        }
      >
        {label}
      </p>

      <div className="mt-3">{children}</div>
    </div>
  );
}

function BriefItem({ label, detail }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black/20 px-4 py-3">
      <p className="text-sm font-semibold text-white">{label}</p>
      {detail ? <p className="mt-1 text-xs leading-5 text-zinc-500">{detail}</p> : null}
    </div>
  );
}