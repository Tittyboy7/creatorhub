import { formatChartPeriod } from "@/lib/formatChartPeriod";

export function buildSavedCompareChartData({ chart, metrics = [] } = {}) {
  if (!chart) return [];

  const selectedPlatforms = chart.config?.platforms || [];

  const matchingMetrics = metrics.filter((metric) => {
    const metricMatches = metric.metric === chart.metric;
    const platformMatches =
      selectedPlatforms.length === 0 ||
      selectedPlatforms.includes(metric.platform);

    return metricMatches && platformMatches;
  });

  const groupKey = chart.compare_by === "month" ? "period" : "platform";

  const totals = matchingMetrics.reduce((result, metric) => {
    const label = metric[groupKey];

    if (!label) return result;

    result[label] = (result[label] || 0) + Number(metric.value || 0);

    return result;
  }, {});

  return Object.entries(totals)
    .map(([label, value]) => ({
      label: chart.compare_by === "month" ? formatChartPeriod(label) : label,
      rawLabel: label,
      value,
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => {
      if (chart.compare_by === "month") {
        return a.rawLabel.localeCompare(b.rawLabel);
      }

      return b.value - a.value;
    });
}