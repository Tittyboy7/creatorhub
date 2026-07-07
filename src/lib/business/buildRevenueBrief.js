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
    title:
      monthlyGrowthPercent >= 0
        ? `Revenue increased ${monthlyGrowthPercent}%`
        : `Revenue decreased ${Math.abs(monthlyGrowthPercent)}%`,
  });

  if (bestPlatform) {
    items.push({
      type: "platform",
      title: `${bestPlatform.platform} remained your strongest revenue source`,
      detail: `${topPlatformPercent}% of tracked revenue`,
    });
  }

  items.push({
    type: "month",
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
      title: "Investigate the strongest growth driver",
      description: `${
        bestPlatform?.platform || "Your strongest platform"
      } appears to be leading your current momentum. Review why that growth happened before planning your next content or campaign.`,
    };
  }

  if (monthlyGrowthPercent < 0) {
    return {
      title: "Identify the source of the decline",
      description:
        "Review your revenue mix and timeline to determine which platform or revenue type changed first.",
    };
  }

  return {
    title: "Look for your next opportunity",
    description:
      "Your revenue is currently stable. Review your highest-performing revenue source and look for one improvement that could compound over time.",
  };
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}