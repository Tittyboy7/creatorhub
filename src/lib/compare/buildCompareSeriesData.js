function formatMonthLabel(month = "") {
  if (!month.includes("-")) return month;

  const [year, monthNumber] = month.split("-");
  const date = new Date(Number(year), Number(monthNumber) - 1, 1);

  const shortMonth = date.toLocaleString("en-US", {
    month: "short",
  });

  const shortYear = date.toLocaleString("en-US", {
    year: "2-digit",
  });

  return `${shortMonth} '${shortYear}`;
}

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
      result[month] = {
        label: formatMonthLabel(month),
        rawLabel: month,
      };
    }

    result[month][platform] =
      (result[month][platform] || 0) + Number(metric.value || 0);

    return result;
  }, {});

  return {
    data: Object.values(totalsByMonth).sort((a, b) =>
      a.rawLabel.localeCompare(b.rawLabel)
    ),
    series: platforms.map((platform) => ({
      key: platform,
      label: platform,
    })),
  };
}