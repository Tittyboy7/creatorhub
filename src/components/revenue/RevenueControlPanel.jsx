import Link from "next/link";
import { formatCurrency } from "@/lib/formatCurrency";

export default function RevenueControlPanel({
  totalRevenue,
  thisMonthRevenue,
  bestPlatform,
  monthlyGrowthPercent,
  connectedPlatformCount,
  syncedEntriesCount,
}) {
  return (
    <aside className="space-y-4">
      <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Revenue Snapshot
        </p>

        <div className="mt-4 space-y-3">
          <MiniStat label="Total Revenue" value={formatCurrency(totalRevenue)} />
          <MiniStat label="This Month" value={formatCurrency(thisMonthRevenue)} />
          <MiniStat
            label="Top Platform"
            value={bestPlatform?.platform || "No data yet"}
            detail={bestPlatform ? formatCurrency(bestPlatform.revenue) : "Add revenue"}
          />
          <MiniStat
            label="Growth"
            value={`${monthlyGrowthPercent >= 0 ? "+" : ""}${monthlyGrowthPercent}%`}
            detail="Month over month"
          />
        </div>
      </section>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Data Readiness
        </p>

        <div className="mt-4 space-y-3">
          <MiniStat label="Connected Platforms" value={connectedPlatformCount} />
          <MiniStat label="Synced Entries" value={syncedEntriesCount} />
        </div>

        <Link
          href="/connected-accounts"
          className="mt-5 inline-flex w-full justify-center rounded-2xl border border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white"
        >
          Manage Connections
        </Link>
      </section>
    </aside>
  );
}

function MiniStat({ label, value, detail }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-white">{value}</p>

      {detail ? <p className="mt-1 text-sm text-zinc-500">{detail}</p> : null}
    </div>
  );
}