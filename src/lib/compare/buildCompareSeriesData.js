export function buildCompareSeriesData({ chart, metrics = [] } = {}) {
  if (!chart || chart.compare_by !== "month") {
    return {
      data: [],
      series: [],
    };
  }

  const matchingMetrics = metrics.filter(
    (metric) => metric.metric === chart.metric && metric.period && metric.platform
  );

  const platforms = [...new Set(matchingMetrics.map((metric) => metric.platform))];

  const totalsByMonth = matchingMetrics.reduce((result, metric) => {
    const month = metric.period;
    const platform = metric.platform;

    if (!result[month]) {
      result[month] = { label: month };
    }

    result[month][platform] =
      (result[month][platform] || 0) + Number(metric.value || 0);

    return result;
  }, {});

  return {
    data: Object.values(totalsByMonth).sort((a, b) =>
      a.label.localeCompare(b.label)
    ),
    series: platforms.map((platform) => ({
      key: platform,
      label: platform,
    })),
  };
}