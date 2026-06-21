export function buildAiInsights({
  bestPlatform,
  topPlatformPercent,
  monthlyGrowthPercent,
  platformCount,
}) {
  return [
    {
      title: "Strongest Platform",
      insight: bestPlatform
        ? `${bestPlatform.platform} is currently your strongest revenue source.`
        : "Add revenue entries to identify your strongest platform.",
    },
    {
      title: "Revenue Risk",
      insight:
        topPlatformPercent >= 70
          ? "A large percentage of revenue is coming from one platform. Diversifying income streams should be a priority."
          : "Revenue is not overly concentrated in one platform right now.",
    },
    {
      title: "Growth Trend",
      insight:
        monthlyGrowthPercent > 0
          ? "Revenue is trending upward compared to the previous tracked month."
          : monthlyGrowthPercent < 0
          ? "Revenue is trending downward compared to the previous tracked month."
          : "Revenue is currently flat compared to the previous tracked month.",
    },
    {
      title: "Next Suggested Action",
      insight:
        platformCount < 3
          ? "Focus on adding or connecting more revenue platforms to improve business stability."
          : "Start optimizing your best-performing platform while maintaining secondary revenue streams.",
    },
  ];
}