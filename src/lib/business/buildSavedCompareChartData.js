import { formatChartPeriod } from "@/lib/formatChartPeriod";

export function buildSavedCompareChartData({ chart, metrics = [] } = {}) {
  if (!chart) return [];

  const matchingMetrics = metrics.filter(
    (metric) => metric.metric === chart.metric
  );

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
        return a.label.localeCompare(b.label);
      }

      return b.value - a.value;
    });
}