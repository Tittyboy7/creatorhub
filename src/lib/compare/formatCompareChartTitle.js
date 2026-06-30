function titleCase(value = "") {
  return value
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatCompareChartTitle(chart) {
  if (!chart) return "Untitled Widget";

  return `${titleCase(chart.metric)} by ${titleCase(chart.compare_by)}`;
}

export function formatCompareChartSubtitle(chart) {
  if (!chart) return "";

  return `${titleCase(chart.chart_type)} chart · ${titleCase(
    chart.metric
  )} · ${chart.time_period}`;
}