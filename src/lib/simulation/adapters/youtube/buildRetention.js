function formatPercent(value) {
  return `${value.toFixed(1)}%`;
}

function calculatePercentChange(
  currentValue,
  previousValue
) {
  if (!previousValue) {
    return 0;
  }

  return (
    ((currentValue - previousValue) /
      previousValue) *
    100
  );
}

function formatPercentChange(value) {
  const roundedValue = Math.round(
    value || 0
  );

  if (roundedValue > 0) {
    return `+${roundedValue}%`;
  }

  return `${roundedValue}%`;
}

function calculateAssetPercentageViewed(
  asset,
  periodKey
) {
  const period =
    asset?.[periodKey] || {};

  const durationSeconds =
    asset?.platformData
      ?.durationSeconds || 0;

  const averageViewDurationSeconds =
    period.averageViewDurationSeconds || 0;

  if (
    !durationSeconds ||
    !averageViewDurationSeconds
  ) {
    return 0;
  }

  return Math.min(
    100,
    (averageViewDurationSeconds /
      durationSeconds) *
      100
  );
}

function calculateWeightedPercentageViewed(
  content,
  periodKey
) {
  let weightedTotal = 0;
  let totalViews = 0;

  content.forEach((asset) => {
    const views =
      asset?.[periodKey]?.views || 0;

    const percentageViewed =
      calculateAssetPercentageViewed(
        asset,
        periodKey
      );

    weightedTotal +=
      percentageViewed * views;

    totalViews += views;
  });

  if (!totalViews) {
    return 0;
  }

  return weightedTotal / totalViews;
}

export default function buildYouTubeRetention({
  creator,
}) {
  const youtube =
    creator?.platforms?.youtube;

  const content =
    youtube?.content || [];

  const publishedContent =
    content.filter(
      (asset) =>
        asset?.status === "published" &&
        asset?.currentPeriod
    );

  if (!publishedContent.length) {
    return null;
  }

  const currentAveragePercentageViewed =
    calculateWeightedPercentageViewed(
      publishedContent,
      "currentPeriod"
    );

  const previousAveragePercentageViewed =
    calculateWeightedPercentageViewed(
      publishedContent,
      "previousPeriod"
    );

  return {
    metrics: [
      {
        label: "Average Percentage Viewed",
        value: formatPercent(
          currentAveragePercentageViewed
        ),
        trend: formatPercentChange(
          calculatePercentChange(
            currentAveragePercentageViewed,
            previousAveragePercentageViewed
          )
        ),
        detail:
          "The average share of each video watched, weighted by views.",
      },
    ],

    overview: {
      label: "Retention Overview",
      text: `Viewers watched an average of ${formatPercent(
        currentAveragePercentageViewed
      )} of your recent published videos.`,
    },

    limitations: {
      hasRetentionCurve: false,
      unsupportedMetrics: [
        "First 30 Seconds",
        "Midpoint Retention",
        "End Screen Reach",
      ],
    },
  };
}