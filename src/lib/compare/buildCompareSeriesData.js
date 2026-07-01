import { normalizePlatformName } from "@/lib/compare/platformRegistry";

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

  const selectedPlatforms = chart.config?.platforms || [];

  const matchingMetrics = metrics.filter((metric) => {
    const platform = normalizePlatformName(metric.platform);

    const metricMatches = metric.metric === chart.metric;
    const hasPeriod = Boolean(metric.period);
    const hasPlatform = Boolean(metric.platform);
    const platformMatches =
      selectedPlatforms.length === 0 || selectedPlatforms.includes(platform);

    return metricMatches && hasPeriod && hasPlatform && platformMatches;
  });

  const platforms = [...new Set(matchingMetrics.map((metric) => metric.platform))];

  const totalsByMonth = matchingMetrics.reduce((result, metric) => {
    const month = metric.period;
    const platform = normalizePlatformName(metric.platform);

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