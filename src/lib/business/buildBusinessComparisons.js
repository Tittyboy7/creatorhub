export function buildBusinessComparisons({
  metrics = [],
  selectedSystem = "all",
  selectedTimePeriod = "all",
} = {}) {
  const revenueMetrics = metrics.filter(
    (metric) => metric.metric === "revenue" && metric.unit === "currency"
  );

  const totalRevenue = revenueMetrics.reduce(
    (sum, metric) => sum + Number(metric.value || 0),
    0
  );

  if (totalRevenue <= 0) {
    return [];
  }

  const revenueByPlatform = revenueMetrics.reduce((totals, metric) => {
    totals[metric.platform] =
      (totals[metric.platform] || 0) + Number(metric.value || 0);

    return totals;
  }, {});

  const rankedPlatforms = Object.entries(revenueByPlatform)
    .map(([platform, value]) => ({
      platform,
      value,
      percent: Math.round((value / totalRevenue) * 100),
    }))
    .sort((a, b) => b.value - a.value);

  const topPlatform = rankedPlatforms[0];

  if (!topPlatform) {
    return [];
  }

  return [
    {
      id: "top-revenue-platform",
      type: "revenue_concentration",
      priority: topPlatform.percent >= 60 ? "high" : "medium",
      title: `${topPlatform.platform} leads tracked revenue`,
      insight: `${topPlatform.platform} generated ${topPlatform.percent}% of tracked revenue during this period.`,
      action: {
        label: "Review revenue mix",
        href: "/revenue#revenue-mix",
      },
      metadata: {
        selectedSystem,
        selectedTimePeriod,
        platform: topPlatform.platform,
        revenue: topPlatform.value,
        percent: topPlatform.percent,
      },
    },
  ];
}