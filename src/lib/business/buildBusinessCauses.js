export function buildBusinessCauses({
  signals = [],
  bestPlatform,
  monthlyGrowthPercent = 0,
  topPlatformPercent = 0,
} = {}) {
  const causes = [];

  if (signals.some((signal) => signal.id === "revenue-growth-negative")) {
    causes.push({
      id: "cause-revenue-growth-negative",
      signalId: "revenue-growth-negative",
      source: "revenue",
      confidence: 90,

      title: "Revenue momentum declined",

      explanation:
        monthlyGrowthPercent <= -20
          ? "Revenue experienced a significant decline compared to the previous tracked month."
          : "Revenue declined compared to the previous tracked month.",

      impact: {
        label: "Monthly Growth",
        value: monthlyGrowthPercent,
      },

      metadata: {
        primary: true,
      },
    });
  }

  if (
    signals.some((signal) => signal.id === "platform-concentration-risk") &&
    bestPlatform?.platform
  ) {
    causes.push({
      id: "cause-platform-concentration",
      signalId: "platform-concentration-risk",
      source: "revenue",
      confidence: 95,

      title: `${bestPlatform.platform} dominates revenue`,

      explanation: `${bestPlatform.platform} currently represents ${topPlatformPercent}% of tracked revenue.`,

      impact: {
        label: "Platform Dependency",
        value: topPlatformPercent,
      },

      metadata: {
        primary: true,
        platform: bestPlatform.platform,
      },
    });
  }

  if (bestPlatform?.platform) {
    causes.push({
      id: "cause-top-platform",
      signalId: "revenue-growth-negative",
      source: "revenue",
      confidence: 65,

      title: `${bestPlatform.platform} should be investigated first`,

      explanation:
        "Your largest revenue source is usually the first place to investigate when overall revenue changes significantly.",

      impact: {
        label: "Largest Platform",
        value: bestPlatform.platform,
      },

      metadata: {
        supporting: true,
      },
    });
  }

  return causes.sort((a, b) => b.confidence - a.confidence);
}