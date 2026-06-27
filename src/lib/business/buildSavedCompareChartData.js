export function buildSavedCompareChartData({ chart, metrics = [] } = {}) {
  if (!chart) return [];

  const matchingMetrics = metrics.filter(
    (metric) => metric.metric === chart.metric
  );

  const totalsBySource = matchingMetrics.reduce((totals, metric) => {
    totals[metric.platform] =
      (totals[metric.platform] || 0) + Number(metric.value || 0);

    return totals;
  }, {});

  return Object.entries(totalsBySource)
    .map(([label, value]) => ({
      label,
      value,
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);
}