import { formatMonth } from "@/lib/formatMonth";
import { formatCurrency } from "@/lib/formatCurrency";

export function buildBusinessInsights({
  topPlatformPercent = 0,
  bestPlatform,
  monthlyGrowthPercent = 0,
  revenueStreak = 0,
  bestMonth = {},
}) {
  return [
    {
      icon: "⚠️",
      title: "Revenue Concentration",
      description: bestPlatform
        ? `${topPlatformPercent}% of your revenue comes from ${bestPlatform.platform}. ${
            topPlatformPercent >= 70
              ? "Consider building additional revenue streams to reduce risk."
              : "Your platform mix is moving in a healthy direction."
          }`
        : "Add revenue entries to see platform dependency insights.",
      trend: topPlatformPercent >= 70 ? "negative" : "positive",
      priority:
        topPlatformPercent >= 70
          ? "high"
          : topPlatformPercent >= 40
          ? "medium"
          : "low",
      actionLabel: "View platform mix",
      actionHref: "/revenue",
    },
    {
      icon: monthlyGrowthPercent >= 0 ? "📈" : "📉",
      title: "Growth Momentum",
      description:
        monthlyGrowthPercent > 0
          ? `Revenue increased ${monthlyGrowthPercent}% compared to your previous tracked month.`
          : monthlyGrowthPercent < 0
          ? `Revenue decreased ${Math.abs(
              monthlyGrowthPercent
            )}% compared to your previous tracked month.`
          : "Revenue is currently flat compared to your previous tracked month.",
      trend:
        monthlyGrowthPercent > 0
          ? "positive"
          : monthlyGrowthPercent < 0
          ? "negative"
          : "neutral",
      priority:
        monthlyGrowthPercent < -20
          ? "high"
          : monthlyGrowthPercent < 0
          ? "medium"
          : "low",
      actionLabel: "Review trend",
      actionHref: "/revenue",
    },
    {
      icon: "🔥",
      title: "Revenue Streak",
      description:
        revenueStreak >= 3
          ? `You have tracked revenue for ${revenueStreak} straight months, which helps CreatorsHub identify stronger patterns.`
          : "Keep adding monthly revenue so CreatorsHub can identify stronger business patterns.",
      trend: revenueStreak >= 3 ? "positive" : "neutral",
      priority: revenueStreak >= 3 ? "low" : "medium",
      actionLabel: "Add revenue",
      actionHref: "/add-revenue",
    },
    {
      icon: "🏆",
      title: "Best Month",
      description: bestMonth.month
        ? `${formatCurrency(bestMonth.revenue)} in ${formatMonth(
            bestMonth.month
          )} is your strongest tracked month so far.`
        : "Your best month will appear once revenue is added.",
      trend: bestMonth.month ? "positive" : "neutral",
      priority: "low",
      actionLabel: "View timeline",
      actionHref: "/revenue",
    },
  ];
}