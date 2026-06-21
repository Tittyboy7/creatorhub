import KpiCard from "./KpiCard";
import SmallInfoCard from "./SmallInfoCard";
import GoalTrackingSection from "./GoalTrackingSection";
import AiInsightsSection from "./AiInsightsSection";
import DashboardWidgetsCard from "./DashboardWidgetsCard";
import { formatCurrency } from "@/lib/formatCurrency";

export default function RevenueSidebar({
  totalRevenue,
  thisMonthRevenue,
  connectedPlatformCount,
  syncedEntriesCount,
  bestPlatform,
  monthlyGrowthPercent,
  platforms,
  revenueTypes,
  selectedPlatform,
  setSelectedPlatform,
  selectedRevenueType,
  setSelectedRevenueType,
  filteredEntries,
  entries,
  hasActiveFilters,
  dashboardWidgets,
  visibleWidgets,
  setVisibleWidgets,
  showIntelligence,
  setShowIntelligence,
  businessInsights,
  goalCards,
  aiInsights,
}) {
  return (
    <aside className="space-y-5 lg:col-span-4 xl:col-span-3">
      <section className="grid grid-cols-2 gap-3">
        <KpiCard label="Total Revenue" value={formatCurrency(totalRevenue)} />
        <KpiCard label="This Month" value={formatCurrency(thisMonthRevenue)} />
        <KpiCard
          label="Connected"
          value={connectedPlatformCount}
          subvalue="Platforms"
        />

        <KpiCard
          label="Synced Entries"
          value={syncedEntriesCount}
          subvalue="API imports"
        />

        <KpiCard
          label="Best Platform"
          value={bestPlatform?.platform || "—"}
          subvalue={bestPlatform ? formatCurrency(bestPlatform.revenue) : ""}
        />

        <KpiCard
          label="Growth"
          value={`${monthlyGrowthPercent >= 0 ? "+" : ""}${monthlyGrowthPercent}%`}
          subvalue="Month over month"
          valueClass={monthlyGrowthPercent >= 0 ? "text-green-400" : "text-red-400"}
        />
      </section>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Filters
        </p>

        <div className="space-y-3">
          <select
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 p-4"
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
          >
            {platforms.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>

          <select
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 p-4"
            value={selectedRevenueType}
            onChange={(e) => setSelectedRevenueType(e.target.value)}
          >
            {revenueTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setSelectedPlatform("All");
              setSelectedRevenueType("All");
            }}
            className="w-full rounded-2xl border border-zinc-700 px-5 py-3 font-semibold hover:bg-zinc-800"
          >
            Reset Filters
          </button>
        </div>

        <p className="mt-4 text-sm text-zinc-500">
          Showing {filteredEntries.length} of {entries.length} entr
          {entries.length === 1 ? "y" : "ies"}
          {hasActiveFilters ? " with active filters" : ""}
        </p>
      </section>

      <DashboardWidgetsCard
        widgets={dashboardWidgets}
        visibleWidgets={visibleWidgets}
        setVisibleWidgets={setVisibleWidgets}
      />

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
        <button
          onClick={() => setShowIntelligence(!showIntelligence)}
          className="flex w-full items-center justify-between gap-4 text-left"
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Business Intelligence
            </p>
            <h2 className="mt-1 text-2xl font-bold">Insights & Goals</h2>
          </div>

          <span className="rounded-xl border border-zinc-700 px-3 py-2 text-sm font-semibold">
            {showIntelligence ? "Hide" : "Show"}
          </span>
        </button>

        {showIntelligence && (
          <div className="mt-5 space-y-4">
            {businessInsights.map((insight) => (
              <SmallInfoCard
                key={insight.title}
                label={insight.title}
                value={insight.value}
                description={insight.description}
              />
            ))}

            <GoalTrackingSection goalCards={goalCards} />

            <SmallInfoCard
              label="Integration Readiness"
              value={`${connectedPlatformCount} connected`}
              description={`${syncedEntriesCount} synced API entries. ${dashboardWidgets.length} dashboard widgets are API-ready.`}
            />
            
            <AiInsightsSection insights={aiInsights} />
          </div>
        )}
      </section>
    </aside>
  );
}