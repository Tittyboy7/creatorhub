function getMetricsByDomain(metrics, domain) {
  return metrics.filter((metric) => metric.domain === domain);
}

function getMetricsByCategory(metrics, category) {
  return metrics.filter(
    (metric) => metric.category === category
  );
}

function sumMetricValues(metrics, metricKeys = []) {
  return metrics
    .filter((metric) => metricKeys.includes(metric.metric))
    .reduce((sum, metric) => sum + Number(metric.value || 0), 0);
}

function getLatestMetric(metrics, metricKey) {
  return (
    metrics
      .filter((metric) => metric.metric === metricKey)
      .sort((a, b) => {
        const aDate = new Date(a.date || a.period || 0).getTime();
        const bDate = new Date(b.date || b.period || 0).getTime();

        return bDate - aDate;
      })[0] || null
  );
}

function getUniqueSources(metrics) {
  return [
    ...new Set(
      metrics
        .map((metric) => metric.source)
        .filter(Boolean)
    ),
  ];
}

function buildDataQuality(metrics) {
  const expectedDomains = [
    "revenue",
    "audience",
    "commerce",
    "content",
    "community",
    "sponsorships",
  ];

  const availableDomains = expectedDomains.filter((domain) =>
    metrics.some((metric) => metric.domain === domain)
  );

  const missingDomains = expectedDomains.filter(
    (domain) => !availableDomains.includes(domain)
  );

  const confidence =
    availableDomains.length >= 5
      ? "high"
      : availableDomains.length >= 2
        ? "medium"
        : "low";

  return {
    availableDomains,
    missingDomains,
    confidence,
  };
}

export function buildBusinessSummary({
  metrics = [],
  monthlyGrowthPercent = 0,
  topPlatformPercent = 0,
  bestPlatform = null,
} = {}) {
  const revenueMetrics = getMetricsByDomain(metrics, "revenue");
  const audienceMetrics = getMetricsByDomain(metrics, "audience");
  const commerceMetrics = getMetricsByDomain(metrics, "commerce");
  const contentMetrics = getMetricsByDomain(metrics, "content");
  const communityMetrics = getMetricsByDomain(metrics, "community");
  const sponsorshipMetrics = getMetricsByDomain(
    metrics,
    "sponsorships"
  );

  const integrationMetrics = getMetricsByCategory(
    metrics,
    "integration"
  );

  const healthyConnections = integrationMetrics.filter(
    (metric) => Number(metric.value) === 1
  );

  const connectionsNeedingAttention = integrationMetrics.filter(
    (metric) => Number(metric.value) === 0
  );

  const latestSubscribers = getLatestMetric(
    audienceMetrics,
    "subscribers"
  );

  const latestFollowers = getLatestMetric(
    audienceMetrics,
    "followers"
  );

  const latestVideos = getLatestMetric(
    contentMetrics,
    "videos"
  );

  const latestStreamHours = getLatestMetric(
    contentMetrics,
    "stream_hours"
  );

  const latestPatrons = getLatestMetric(
    communityMetrics,
    "patrons"
  );

  const revenueSources = getUniqueSources(revenueMetrics);

  return {
    generatedAt: new Date().toISOString(),

    integrations: {
      connectedAccounts: integrationMetrics.length,
      healthyConnections: healthyConnections.length,
      connectionsNeedingAttention:
        connectionsNeedingAttention.length,

      affectedPlatforms: [
        ...new Set(
          connectionsNeedingAttention
            .map((metric) => metric.source)
            .filter(Boolean)
        ),
      ],
    },

    revenue: {
      total: sumMetricValues(revenueMetrics, [
        "revenue",
        "estimated_revenue",
        "monthly_revenue",
      ]),

      grossRevenue: sumMetricValues(revenueMetrics, [
        "gross_revenue",
      ]),

      netRevenue: sumMetricValues(revenueMetrics, [
        "net_revenue",
      ]),

      refunds: sumMetricValues(revenueMetrics, [
        "refunds",
      ]),

      monthlyGrowthPercent,
      strongestPlatform: bestPlatform?.platform || null,
      strongestPlatformAmount: Number(bestPlatform?.amount || 0),
      concentrationPercent: topPlatformPercent,
      sourceCount: revenueSources.length,
      sources: revenueSources,
    },

    audience: {
      subscribers: Number(latestSubscribers?.value || 0),
      followers: Number(latestFollowers?.value || 0),

      views: sumMetricValues(audienceMetrics, [
        "views",
      ]),

      averageViewers: Number(
        getLatestMetric(
          audienceMetrics,
          "average_viewers"
        )?.value || 0
      ),

      watchTimeHours: Number(
        getLatestMetric(
          audienceMetrics,
          "watch_time"
        )?.value || 0
      ),
    },

    commerce: {
      revenue: sumMetricValues(commerceMetrics, [
        "revenue",
        "total_order_revenue",
      ]),

      orders: sumMetricValues(commerceMetrics, [
        "orders",
      ]),

      products: sumMetricValues(commerceMetrics, [
        "products",
      ]),

      customers: sumMetricValues(commerceMetrics, [
        "customers",
      ]),

      successfulPayments: sumMetricValues(
        commerceMetrics,
        ["successful_payments"]
      ),

      averageOrderValue: Number(
        getLatestMetric(
          commerceMetrics,
          "average_order_value"
        )?.value || 0
      ),
    },

    content: {
      videosPublished: Number(latestVideos?.value || 0),
      streamHours: Number(latestStreamHours?.value || 0),
    },

    community: {
      patrons: Number(latestPatrons?.value || 0),

      subscriptions: sumMetricValues(
        communityMetrics,
        ["subs"]
      ),

      newMembers: sumMetricValues(
        communityMetrics,
        ["new_members"]
      ),

      churnPercent: Number(
        getLatestMetric(
          communityMetrics,
          "churn"
        )?.value || 0
      ),
    },

    sponsorships: {
      revenue: sumMetricValues(
        sponsorshipMetrics,
        ["sponsor_revenue"]
      ),

      campaigns: sumMetricValues(
        sponsorshipMetrics,
        ["campaigns"]
      ),

      renewalRate: Number(
        getLatestMetric(
          sponsorshipMetrics,
          "renewal_rate"
        )?.value || 0
      ),
    },

    dataQuality: buildDataQuality(metrics),
  };
}