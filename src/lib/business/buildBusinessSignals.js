export function buildBusinessSignals({
  totalRevenue = 0,
  monthlyGrowthPercent = 0,
  topPlatformPercent = 0,
  bestPlatform,
  platformCount = 0,
  revenueStreak = 0,
} = {}) {
  const signals = [];

  if (monthlyGrowthPercent > 0) {
    signals.push({
      id: "revenue-growth-positive",
      source: "revenue",
      category: "growth",
      severity: "low",
      title: "Revenue momentum is positive",
      reason: `Tracked revenue is up ${monthlyGrowthPercent}% compared to the previous tracked month.`,
      recommendation:
        "Identify which platform, product, or revenue type caused the increase so you can repeat what is working.",
      metric: monthlyGrowthPercent,
      action: {
        label: "Review growth drivers",
        href: "/revenue",
      },
      metadata: {
        monthlyGrowthPercent,
      },
    });
  }

  if (monthlyGrowthPercent < 0) {
    signals.push({
      id: "revenue-growth-negative",
      source: "revenue",
      category: "risk",
      severity: monthlyGrowthPercent <= -20 ? "high" : "medium",
      title: "Revenue momentum is down",
      reason: `Tracked revenue is down ${Math.abs(
        monthlyGrowthPercent
      )}% compared to the previous tracked month.`,
      recommendation:
        "Look for the platform, product, or revenue type where the drop started before making new growth decisions.",
      metric: monthlyGrowthPercent,
      action: {
        label: "Review revenue timeline",
        href: "/revenue",
      },
      metadata: {
        monthlyGrowthPercent,
      },
    });
  }

  if (topPlatformPercent >= 60 && bestPlatform?.platform) {
    signals.push({
      id: "platform-concentration-risk",
      source: "revenue",
      category: "risk",
      severity: topPlatformPercent >= 75 ? "high" : "medium",
      title: "Revenue is concentrated",
      reason: `${bestPlatform.platform} accounts for ${topPlatformPercent}% of tracked revenue.`,
      recommendation:
        "Start building a second reliable revenue channel so your business is less exposed to one platform.",
      metric: topPlatformPercent,
      action: {
        label: "Review platform mix",
        href: "/revenue",
      },
      metadata: {
        platform: bestPlatform.platform,
        topPlatformPercent,
      },
    });
  }

  if (platformCount < 3) {
    signals.push({
      id: "platform-diversity-low",
      source: "connected_accounts",
      category: "opportunity",
      severity: "medium",
      title: "More connections will improve recommendations",
      reason:
        "CreatorsHub currently has limited connected platform data to compare across your business.",
      recommendation:
        "Connect another revenue platform so CreatorsHub can identify stronger cross-platform patterns.",
      metric: platformCount,
      action: {
        label: "Connect another platform",
        href: "/connected-accounts",
      },
      metadata: {
        platformCount,
      },
    });
  }

  if (revenueStreak >= 3) {
    signals.push({
      id: "revenue-tracking-streak",
      source: "revenue",
      category: "stability",
      severity: "low",
      title: "Revenue tracking is consistent",
      reason: `You have tracked revenue for ${revenueStreak} straight months.`,
      recommendation:
        "Keep tracking consistently so CreatorsHub can identify stronger trends, forecasts, and recommendations over time.",
      metric: revenueStreak,
      action: {
        label: "View revenue dashboard",
        href: "/revenue",
      },
      metadata: {
        revenueStreak,
      },
    });
  }

  const severityRank = {
    high: 1,
    medium: 2,
    low: 3,
  };

  return signals.sort(
    (a, b) =>
      (severityRank[a.severity] || 99) - (severityRank[b.severity] || 99)
  );
}