export function buildPlatformComparisonMetrics({ metrics = [] } = {}) {
  return metrics
    .filter((metric) => metric.source && metric.metric)
    .map((metric) => ({
      id: metric.id,
      platform: metric.source,
      metric: metric.metric,
      label: metric.label,
      value: Number(metric.value || 0),
      unit: metric.unit,
      period: metric.period,
      date: metric.date,
      category: metric.category,
      metadata: metric.metadata || {},
    }));
}