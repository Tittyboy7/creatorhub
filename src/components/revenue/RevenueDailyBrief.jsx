import Link from "next/link";
import { formatCurrency } from "@/lib/formatCurrency";

function formatGrowth(value) {
  return Number(value || 0) >= 0 ? `up ${value}%` : `down ${Math.abs(value)}%`;
}

export default function RevenueDailyBrief({
  totalRevenue,
  thisMonthRevenue,
  monthlyGrowthPercent,
  bestPlatform,
  topPlatformPercent,
  upcomingPayouts = [],
}) {
  const platformName = bestPlatform?.platform || "your top platform";
  const nextPayout = upcomingPayouts?.[0];

  return (
    <section className="overflow-hidden rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6">
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Daily Brief
          </p>

          <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight md:text-5xl">
            Revenue is {formatGrowth(monthlyGrowthPercent)} this month.
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-zinc-400">
            You have tracked{" "}
            <span className="font-semibold text-white">
              {formatCurrency(totalRevenue)}
            </span>{" "}
            in total revenue, with{" "}
            <span className="font-semibold text-white">
              {formatCurrency(thisMonthRevenue)}
            </span>{" "}
            coming from the current month.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <BriefPill
              label="Top Platform"
              value={platformName}
              detail={`${topPlatformPercent || 0}% of revenue`}
            />

            <BriefPill
              label="Next Payout"
              value={nextPayout?.platform || "No payout yet"}
              detail={nextPayout?.timing || "Sync payout platforms"}
            />

            <BriefPill
              label="Recommendation"
              value="Review opportunities"
              detail="1 action worth checking"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href="/add-revenue"
            className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black hover:bg-zinc-200"
          >
            Add Revenue
          </Link>

          <Link
            href="/connected-accounts"
            className="rounded-2xl border border-zinc-700 px-5 py-3 text-sm font-bold text-white hover:bg-zinc-900"
          >
            Connect Platform
          </Link>
        </div>
      </div>
    </section>
  );
}

function BriefPill({ label, value, detail }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-2 truncate text-lg font-bold text-white">{value}</p>
      <p className="mt-1 truncate text-sm text-zinc-500">{detail}</p>
    </div>
  );
}