import { calculateRevenueStats } from "@/lib/revenue/calculateRevenueStats";

export function useRevenueStats({ filteredEntries, totalRevenue }) {
  const {
    monthlyChartData,
    platformChartData,
    revenueTypeChartData,
  } = calculateRevenueStats(filteredEntries);

  const recentMonthlyChartData = monthlyChartData.slice(-12);

  const bestPlatform = platformChartData[0];

  const averageMonthlyRevenue =
    monthlyChartData.length === 0 ? 0 : totalRevenue / monthlyChartData.length;

  const previousMonthRevenue =
    recentMonthlyChartData.length < 2
      ? 0
      : recentMonthlyChartData[recentMonthlyChartData.length - 2].revenue;

  const latestMonthRevenue =
    recentMonthlyChartData.length === 0
      ? 0
      : recentMonthlyChartData[recentMonthlyChartData.length - 1].revenue;

  const monthlyGrowthPercent =
    previousMonthRevenue === 0
      ? latestMonthRevenue > 0
        ? 100
        : 0
      : Math.round(
          ((latestMonthRevenue - previousMonthRevenue) / previousMonthRevenue) *
            100
        );

  const projectedNextMonthRevenue =
    latestMonthRevenue * (1 + monthlyGrowthPercent / 100);

  const projectedAnnualRevenue = averageMonthlyRevenue * 12;

  const topPlatformPercent =
    totalRevenue === 0 || !bestPlatform
      ? 0
      : Math.round((bestPlatform.revenue / totalRevenue) * 100);

  const bestMonth = monthlyChartData.reduce(
    (best, month) => (month.revenue > best.revenue ? month : best),
    { month: "", revenue: 0 }
  );

  const revenueStreak = [...monthlyChartData]
    .reverse()
    .reduce(
      (streak, month) => {
        if (streak.stopped) return streak;

        if (month.revenue > 0) {
          return { count: streak.count + 1, stopped: false };
        }

        return { count: streak.count, stopped: true };
      },
      { count: 0, stopped: false }
    ).count;

  const platformCount = platformChartData.length;

  return {
    monthlyChartData,
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
  };
}