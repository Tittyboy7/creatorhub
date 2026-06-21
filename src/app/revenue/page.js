"use client";

import Link from "next/link";

import RevenueEventsSection from "@/components/revenue/RevenueEventsSection";
import RevenueTimeline from "@/components/revenue/RevenueTimeline";
import RevenueHero from "@/components/revenue/RevenueHero";
import RevenueSidebar from "@/components/revenue/RevenueSidebar";
import RevenueMainContent from "@/components/revenue/RevenueMainContent";

import { useRevenueStats } from "@/hooks/useRevenueStats";
import { useRevenueData } from "@/hooks/useRevenueData";
import { useRevenueUI } from "@/hooks/useRevenueUI";
import { buildDashboardWidgets } from "@/lib/revenue/buildDashboardWidgets";
import { buildUpcomingPayouts } from "@/lib/revenue/buildUpcomingPayouts";
import { buildRevenueEvents } from "@/lib/revenue/buildRevenueEvents";
import { buildGoalCards } from "@/lib/revenue/buildGoalCards";
import { buildAiInsights } from "@/lib/revenue/buildAiInsights";
import { buildBusinessInsights } from "@/lib/revenue/buildBusinessInsights";
import { buildPlatformHealthCards } from "@/lib/revenue/buildPlatformHealthCards";
import { groupEntriesByMonth } from "@/lib/revenue/groupEntriesByMonth";
import { chartColors } from "@/lib/revenue/chartColors";
import { getCurrentMonth } from "@/lib/getCurrentMonth";
import { filterRevenueEntries } from "@/lib/revenue/filterRevenueEntries";
import { buildRevenueFilterOptions } from "@/lib/revenue/buildRevenueFilterOptions";
import { calculateRevenueTotals } from "@/lib/revenue/calculateRevenueTotals";
import { hasActiveRevenueFilters } from "@/lib/revenue/hasActiveRevenueFilters";

export default function RevenuePage() {

  const {
    loading,
    entries,
    connectedAccounts,
    handleDeleteEntry,
  } = useRevenueData();

  const {
    selectedPlatform,
    setSelectedPlatform,
    selectedRevenueType,
    setSelectedRevenueType,
    chartType,
    setChartType,
    showIntelligence,
    setShowIntelligence,
    visibleWidgets,
    setVisibleWidgets,
  } = useRevenueUI();

  const { platforms, revenueTypes } = buildRevenueFilterOptions(entries);

  const filteredEntries = filterRevenueEntries({
    entries,
    selectedPlatform,
    selectedRevenueType,
  });

  const currentMonth = getCurrentMonth();

  const { totalRevenue, thisMonthRevenue } = calculateRevenueTotals({
    filteredEntries,
    currentMonth,
  });

  const {
    platformChartData,
    revenueTypeChartData,
    recentMonthlyChartData,
    bestPlatform,
    averageMonthlyRevenue,
    monthlyGrowthPercent,
    projectedNextMonthRevenue,
    projectedAnnualRevenue,
    topPlatformPercent,
    bestMonth,
    revenueStreak,
    platformCount,
  } = useRevenueStats({
    filteredEntries,
    totalRevenue,
  });

  const hasActiveFilters = hasActiveRevenueFilters({
    selectedPlatform,
    selectedRevenueType,
  });

  const revenueGoal = 10000;

  const goalCards = buildGoalCards({
    totalRevenue,
    revenueGoal,
  });

  const upcomingPayouts = buildUpcomingPayouts();

  const revenueEvents = buildRevenueEvents();

  const aiInsights = buildAiInsights({
    bestPlatform,
    topPlatformPercent,
    monthlyGrowthPercent,
    platformCount,
  });

  const dashboardWidgets = buildDashboardWidgets();

  const businessInsights = buildBusinessInsights({
    topPlatformPercent,
    bestPlatform,
    monthlyGrowthPercent,
    revenueStreak,
    bestMonth,
  });

  const platformHealthCards = buildPlatformHealthCards({
    platformChartData,
    monthlyGrowthPercent,
    connectedAccounts,
  });

  const entriesByMonth = groupEntriesByMonth(filteredEntries);

  const connectedPlatformCount = connectedAccounts.length;

  const syncedEntriesCount = filteredEntries.filter(
    (entry) => entry.synced_from_api
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-5 py-8 text-white md:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <Link
          href="/dashboard"
          className="inline-block rounded-2xl border border-zinc-700 px-5 py-3 hover:bg-zinc-800"
        >
          Back to Dashboard
        </Link>

        <RevenueHero />

        <section
          className="gap-6"
          style={{
            display: "grid",
            gridTemplateColumns: "380px minmax(0, 1fr)",
            alignItems: "start",
          }}
        >
          <RevenueSidebar
            totalRevenue={totalRevenue}
            thisMonthRevenue={thisMonthRevenue}
            connectedPlatformCount={connectedPlatformCount}
            syncedEntriesCount={syncedEntriesCount}
            bestPlatform={bestPlatform}
            monthlyGrowthPercent={monthlyGrowthPercent}
            platforms={platforms}
            revenueTypes={revenueTypes}
            selectedPlatform={selectedPlatform}
            setSelectedPlatform={setSelectedPlatform}
            selectedRevenueType={selectedRevenueType}
            setSelectedRevenueType={setSelectedRevenueType}
            filteredEntries={filteredEntries}
            entries={entries}
            hasActiveFilters={hasActiveFilters}
            dashboardWidgets={dashboardWidgets}
            visibleWidgets={visibleWidgets}
            setVisibleWidgets={setVisibleWidgets}
            showIntelligence={showIntelligence}
            setShowIntelligence={setShowIntelligence}
            businessInsights={businessInsights}
            goalCards={goalCards}
            aiInsights={aiInsights}
          />

          <RevenueMainContent
            platformChartData={platformChartData}
            revenueTypeChartData={revenueTypeChartData}
            totalRevenue={totalRevenue}
            chartColors={chartColors}
            visibleWidgets={visibleWidgets}
            platformHealthCards={platformHealthCards}
            chartType={chartType}
            setChartType={setChartType}
            recentMonthlyChartData={recentMonthlyChartData}
            averageMonthlyRevenue={averageMonthlyRevenue}
            projectedAnnualRevenue={projectedAnnualRevenue}
            projectedNextMonthRevenue={projectedNextMonthRevenue}
            upcomingPayouts={upcomingPayouts}
          />
        </section>

        {visibleWidgets.revenueEvents && (
          <RevenueEventsSection events={revenueEvents} />
        )}

        {visibleWidgets.revenueTimeline && (
          <RevenueTimeline
            filteredEntries={filteredEntries}
            entriesByMonth={entriesByMonth}
            handleDeleteEntry={handleDeleteEntry}
          />
        )}
      </div>
    </div>
  );
}