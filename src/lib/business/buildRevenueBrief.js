export function buildRevenueBrief({
  totalRevenue = 0,
  thisMonthRevenue = 0,
  monthlyGrowthPercent = 0,
  bestPlatform,
  topPlatformPercent = 0,
}) {
  return {
    headline: buildHeadline(monthlyGrowthPercent),

    lifetimeRevenue: {
      value: totalRevenue,
      monthlyGrowthPercent,
    },

    changes: buildChanges({
      thisMonthRevenue,
      monthlyGrowthPercent,
      bestPlatform,
      topPlatformPercent,
    }),

    recommendation: buildRecommendation({
      monthlyGrowthPercent,
      bestPlatform,
    }),

    confidence: "medium",
  };
}

function buildHeadline(monthlyGrowthPercent) {
  if (monthlyGrowthPercent > 0) {
    return "Revenue increased since your last review.";
  }

  if (monthlyGrowthPercent < 0) {
    return "Revenue declined since your last review.";
  }

  return "No major revenue changes detected.";
}

function buildChanges({
  thisMonthRevenue,
  monthlyGrowthPercent,
  bestPlatform,
  topPlatformPercent,
}) {
  const items = [];

  items.push({
    type: "growth",
    importance: "high",
    title:
      monthlyGrowthPercent > 0
        ? `Revenue increased ${monthlyGrowthPercent}%`
        : monthlyGrowthPercent < 0
        ? `Revenue decreased ${Math.abs(monthlyGrowthPercent)}%`
        : "Revenue stayed flat",
    detail:
      monthlyGrowthPercent > 0
        ? "Your tracked revenue is trending upward compared with the previous tracked month."
        : monthlyGrowthPercent < 0
        ? "Your tracked revenue is below the previous tracked month."
        : "No major movement compared with the previous tracked month.",
  });

  if (bestPlatform) {
    items.push({
      type: "platform",
      importance: "medium",
      title: `${bestPlatform.platform} is your strongest revenue source`,
      detail:
        topPlatformPercent >= 60
          ? `${topPlatformPercent}% of tracked revenue. This may create platform concentration risk.`
          : `${topPlatformPercent}% of tracked revenue. Your revenue mix looks reasonably balanced.`,
    });
  }

  items.push({
    type: "month",
    importance: "low",
    title:
      thisMonthRevenue > 0
        ? `${formatCurrency(thisMonthRevenue)} tracked this month`
        : "No revenue tracked this month yet",
    detail:
      thisMonthRevenue > 0
        ? "Current month revenue across synced and manual sources."
        : "Sync platforms or add revenue entries to update this month.",
  });

  return items;
}

function buildRecommendation({
  monthlyGrowthPercent,
  bestPlatform,
}) {
  if (monthlyGrowthPercent > 0) {
    return {
      title: "Double down carefully",
      description: `${
        bestPlatform?.platform || "Your strongest platform"
      } appears to be leading your current momentum. Review what caused the increase, then repeat the strongest pattern without relying on one platform too heavily.`,
    };
  }

  if (monthlyGrowthPercent < 0) {
    return {
      title: "Find the leak",
      description:
        "Revenue is down, so the priority is to identify where the decline started. Review your revenue mix and timeline before changing your strategy.",
    };
  }

  return {
    title: "Look for a small growth lever",
    description:
      "Revenue is stable, which gives you room to improve intentionally. Review your strongest revenue source and choose one small experiment that could increase conversion, retention, or repeat purchases.",
    };
  }

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}