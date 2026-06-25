export function summarizeBusinessMetrics({ metrics = [] } = {}) {
  return {
    totalMetrics: metrics.length,
    revenueMetrics: metrics.filter((metric) => metric.category === "revenue").length,
    productMetrics: metrics.filter((metric) => metric.category === "product").length,
    integrationMetrics: metrics.filter(
      (metric) => metric.category === "integration"
    ).length,
  };
}