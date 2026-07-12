import Link from "next/link";

export default function BusinessTodaySection({
  totalRevenue,
  revenueThisMonth,
  totalFollowers,
  productsCount,
  notificationsCount,
  completedSetupCount,
  setupItemCount,
}) {

    const setupScore =
      setupItemCount > 0
        ? Math.round((Number(completedSetupCount || 0) / setupItemCount) * 100)
        : 0;

    const businessHealthScore = Math.min(
      100,
      Math.round((setupScore + (totalRevenue > 0 ? 20 : 0) + (productsCount > 0 ? 15 : 0)) / 1.35)
    );


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

      <div
        className="grid divide-y divide-zinc-800 md:divide-x md:divide-y-0"
        style={{
          gridTemplateColumns: "0.8fr 1.2fr 1fr",
        }}
      >
        <div className="bg-zinc-950/40 p-5 md:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Business Health
          </p>

          <p className="mt-3 text-5xl font-black text-white">
            {businessHealthScore}
          </p>

          <p className="mt-2 text-sm font-semibold text-emerald-400">
            Stable
          </p>

          <p className="mt-4 text-sm leading-6 text-zinc-400">
            Based on revenue tracking, product activity, profile setup, and recent business signals.
          </p>
        </div>

        <div className="bg-zinc-950/40 p-5 md:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Morning Brief
          </p>

          <div className="mt-3 space-y-3">
            <BriefItem
              label={`Revenue this month: ${formatCurrency(revenueThisMonth)}`}
              detail={`Lifetime tracked revenue: ${formatCurrency(totalRevenue)}`}
              importance="high"
            />

            <BriefItem
              label={`${totalFollowers || 0} followers tracked`}
              detail="Audience signals will become smarter as more platforms connect."
              importance="medium"
            />

            <BriefItem
              label={`${productsCount || 0} products listed`}
              detail="Commerce insights will improve as product and order data expands."
              importance="low"
            />
          </div>
        </div>

        <div className="bg-emerald-500/5 p-5 md:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
            Recommended Focus
          </p>

          <h3 className="mt-3 text-xl font-bold text-white">
            Strengthen your revenue system
          </h3>

          <p className="mt-3 text-sm leading-6 text-zinc-300">
            Review your revenue intelligence first. It currently has the strongest business data available.
          </p>

          <div className="mt-4 border-t border-emerald-500/20 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
              Suggested action
            </p>

            <Link
              href="/revenue"
              className="mt-2 inline-flex text-sm font-semibold text-emerald-100 hover:text-white"
            >
              Open Revenue Intelligence →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function BriefItem({ label, detail, importance = "medium" }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-zinc-800 bg-black/20 px-4 py-3">
      <span
        className="mt-1 inline-block h-2.5 w-2.5 min-h-2.5 min-w-2.5 shrink-0 rounded-full"
        style={{
          backgroundColor: getImportanceColor(importance),
          boxShadow: `0 0 10px ${getImportanceGlow(importance)}`,
        }}
      />

      <div>
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="mt-1 text-xs leading-5 text-zinc-500">{detail}</p>
      </div>
    </div>
  );
}

function getImportanceColor(importance) {
  if (importance === "high") return "#34d399";
  if (importance === "medium") return "#60a5fa";
  return "#71717a";
}

function getImportanceGlow(importance) {
  if (importance === "high") return "rgba(52, 211, 153, 0.7)";
  if (importance === "medium") return "rgba(96, 165, 250, 0.55)";
  return "rgba(113, 113, 122, 0.35)";
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value || 0));
}