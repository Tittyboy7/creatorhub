function getConfidenceLabel(score) {
  if (score >= 80) return "High confidence";
  if (score >= 60) return "Good confidence";
  if (score >= 40) return "Limited confidence";

  return "Low confidence";
}

function buildConfidence({
  status = "unknown",
  metrics = [],
  lastSyncedAt = null,
} = {}) {
  const availableMetrics = metrics.filter(
    (metric) =>
      metric?.value !== null &&
      metric?.value !== undefined &&
      metric?.value !== ""
  );

  const metricCoverageScore = Math.min(
    100,
    availableMetrics.length * 20
  );

  const connectionScore =
    status === "healthy"
      ? 100
      : status === "attention"
        ? 55
        : 35;

  const freshnessScore = getFreshnessScore(lastSyncedAt);

  const score = Math.round(
    connectionScore * 0.45 +
      metricCoverageScore * 0.35 +
      freshnessScore * 0.2
  );

  return {
    score,
    label: getConfidenceLabel(score),
    connectionStatus:
      status === "healthy"
        ? "Healthy"
        : status === "attention"
          ? "Needs attention"
          : "Unknown",
    metricCoverage: `${availableMetrics.length}/${Math.max(
      metrics.length,
      1
    )}`,
    freshness: getFreshnessLabel(lastSyncedAt),
  };
}

function buildPriority({
  platformName = "This platform",
  status = "unknown",
  headline,
  summary,
  recommendation,
  action,
} = {}) {
  if (status === "attention") {
    return {
      id: "platform-connection-warning",
      eyebrow: "Today’s Priority",
      title: `Reconnect ${platformName}`,
      explanation:
        summary ||
        `${platformName} data may be incomplete or outdated until the connection is repaired.`,
      impact: `${platformName} intelligence`,
      action:
        action || {
          label: `Reconnect ${platformName}`,
          href: `/connected-accounts/${platformName.toLowerCase()}`,
        },
      severity: "high",
    };
  }

  return {
    id: "platform-performance-review",
    eyebrow: "Today’s Priority",

    title:
      recommendation ||
      headline ||
      `Review ${platformName} performance`,

    explanation:
      summary ||
      headline ||
      `${platformName} has no urgent connection issue. Review its strongest recent signal before deciding what to do next.`,

    impact: `${platformName} performance`,

    action:
      action || {
        label: `Review ${platformName}`,
        href: "#platform-performance",
      },

    severity: recommendation ? "medium" : "low",
  };
}

function buildEvidence({
  reasons = [],
  metrics = [],
} = {}) {
  const evidence = [];

  reasons.slice(0, 2).forEach((reason, index) => {
    evidence.push({
      id: `reason-${index}`,
      title:
        index === 0
          ? "Primary platform signal"
          : "Supporting platform signal",
      detail: reason,
      importance: index === 0 ? "medium" : "low",
    });
  });

  if (evidence.length < 3) {
    const metricWithTrend = metrics.find(
      (metric) => metric?.trend
    );

    if (metricWithTrend) {
      evidence.push({
        id: "metric-trend",
        title: `${metricWithTrend.label}: ${metricWithTrend.value}`,
        detail: `Current trend: ${metricWithTrend.trend}.`,
        importance: metricWithTrend.trend.startsWith("-")
          ? "high"
          : "medium",
      });
    }
  }

  if (evidence.length === 0) {
    evidence.push({
      id: "limited-platform-evidence",
      title: "Platform evidence is limited",
      detail:
        "Sync this platform and collect historical snapshots to improve recommendations.",
      importance: "low",
    });
  }

  return evidence.slice(0, 3);
}

function buildSnapshot({
  metrics = [],
  status = "unknown",
  accountName = null,
  lastSyncedLabel = null,
} = {}) {
  const snapshot = metrics.slice(0, 4).map(
    (metric, index) => ({
      id: metric.id || `metric-${index}`,
      label: metric.label,
      value: metric.value,
      trend: metric.trend || null,
      history: Array.isArray(metric.history)
        ? metric.history
        : [],
    })
  );
  return snapshot;
}

export function buildPlatformToday({
  platformName = "This platform",
  status = "unknown",
  accountName = null,
  lastSyncedAt = null,
  lastSyncedLabel = null,
  headline = null,
  summary = null,
  recommendation = null,
  action = null,
  metrics = [],
  reasons = [],
} = {}) {
  return {
    generatedAt: new Date().toISOString(),

    platform: {
      name: platformName,
      accountName,
      status,
    },

    priority: buildPriority({
      platformName,
      status,
      headline,
      summary,
      recommendation,
      action,
    }),

    confidence: buildConfidence({
      status,
      metrics,
      lastSyncedAt,
    }),

    evidence: buildEvidence({
      reasons,
      metrics,
    }),

    snapshot: buildSnapshot({
      metrics,
      status,
      accountName,
      lastSyncedLabel,
    }),
  };
}

function getFreshnessScore(lastSyncedAt) {
  if (!lastSyncedAt) return 40;

  const syncedTime = new Date(lastSyncedAt).getTime();

  if (!Number.isFinite(syncedTime)) return 40;

  const hoursSinceSync =
    (Date.now() - syncedTime) / (1000 * 60 * 60);

  if (hoursSinceSync <= 6) return 100;
  if (hoursSinceSync <= 24) return 80;
  if (hoursSinceSync <= 72) return 60;

  return 35;
}

function getFreshnessLabel(lastSyncedAt) {
  if (!lastSyncedAt) return "Unknown";

  const syncedTime = new Date(lastSyncedAt).getTime();

  if (!Number.isFinite(syncedTime)) return "Unknown";

  const hoursSinceSync =
    (Date.now() - syncedTime) / (1000 * 60 * 60);

  if (hoursSinceSync <= 6) return "Current";
  if (hoursSinceSync <= 24) return "Recent";
  if (hoursSinceSync <= 72) return "Aging";

  return "Outdated";
}