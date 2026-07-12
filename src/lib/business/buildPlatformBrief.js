export function buildPlatformBrief({
  platformName = "This platform",
  status = "healthy",
  keyMetrics = [],
  reasons = [],
  recommendation,
} = {}) {
  const primaryMetric = keyMetrics[0];

  return {
    headline: buildHeadline({
      platformName,
      status,
      primaryMetric,
    }),

    summary:
      reasons[0] ||
      `${platformName} performance is ready to review.`,

    recommendation:
      recommendation ||
      "Review the strongest signal from this platform and decide whether it should influence your next creator business action.",

    priority: status === "attention" ? "medium" : "low",

    action: {
      label: "Review Content Performance",
      href: "#content-performance",
    },

    metrics: keyMetrics,
  };
}

function buildHeadline({ platformName, status, primaryMetric }) {
  if (status === "attention") {
    return `${platformName} needs attention today.`;
  }

  if (primaryMetric?.trend?.startsWith("+")) {
    return `${platformName} is showing positive momentum.`;
  }

  if (primaryMetric?.trend?.startsWith("-")) {
    return `${platformName} performance is down today.`;
  }

  return `${platformName} is stable today.`;
}