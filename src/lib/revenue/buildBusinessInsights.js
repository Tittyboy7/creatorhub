import { formatMonth } from "@/lib/formatMonth";
import { formatCurrency } from "@/lib/formatCurrency";

export function buildBusinessInsights({
  topPlatformPercent,
  bestPlatform,
  monthlyGrowthPercent,
  revenueStreak,
  bestMonth,
}) {
  return [
    {
      title: "Revenue Concentration",
      value:
        topPlatformPercent >= 70
          ? "High Dependency"
          : topPlatformPercent >= 40
          ? "Moderate Dependency"
          : "Healthy Mix",
      description: bestPlatform
        ? `${topPlatformPercent}% of your revenue comes from ${bestPlatform.platform}. ${
            topPlatformPercent >= 70
              ? "Consider building additional revenue streams to reduce risk."
              : "Your platform mix is moving in a healthy direction."
          }`
        : "Add revenue entries to see platform dependency insights.",
    },
    {
      title: "Growth Momentum",
      value:
        monthlyGrowthPercent > 0
          ? `+${monthlyGrowthPercent}%`
          : `${monthlyGrowthPercent}%`,
      description:
        monthlyGrowthPercent > 0
          ? "Revenue increased compared to your previous tracked month."
          : monthlyGrowthPercent < 0
          ? "Revenue decreased compared to your previous tracked month."
          : "Revenue is currently flat compared to your previous tracked month.",
    },
    {
      title: "Revenue Streak",
      value: `${revenueStreak} month${revenueStreak === 1 ? "" : "s"}`,
      description:
        revenueStreak >= 3
          ? "You are building consistent revenue momentum."
          : "Keep adding monthly revenue to build a stronger tracking streak.",
    },
    {
      title: "Best Month",
      value: bestMonth.month ? formatMonth(bestMonth.month) : "—",
      description: bestMonth.month
        ? `${formatCurrency(bestMonth.revenue)} was your strongest tracked month.`
        : "Your best month will appear once revenue is added.",
    },
  ];
}