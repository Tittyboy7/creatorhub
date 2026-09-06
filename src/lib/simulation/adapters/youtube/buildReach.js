function formatCompactNumber(value) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);
}

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
  const roundedValue = Math.round(value || 0);

  if (roundedValue > 0) {
    return `+${roundedValue}%`;
  }

  return `${roundedValue}%`;
}

function sumMetric(content, getter) {
  return content.reduce(
    (total, asset) =>
      total + (getter(asset) || 0),
    0
  );
}

function calculateWeightedCtr(content) {
  const totalImpressions = sumMetric(
    content,
    (asset) =>
      asset.currentPeriod?.impressions
  );

  if (!totalImpressions) {
    return 0;
  }

  const weightedClicks =
    content.reduce(
      (total, asset) => {
        const impressions =
          asset.currentPeriod?.impressions || 0;

        const ctr =
          asset.currentPeriod
            ?.clickThroughRate || 0;

        return (
          total +
          impressions * (ctr / 100)
        );
      },
      0
    );

  return (
    (weightedClicks / totalImpressions) *
    100
  );
}

function calculateSubscriberConversion({
  subscribersGained,
  views,
}) {
  if (!views) {
    return 0;
  }

  return (
    (subscribersGained / views) *
    100
  );
}

export default function buildYouTubeReach({
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

  const currentImpressions =
    sumMetric(
      publishedContent,
      (asset) =>
        asset.currentPeriod
          ?.impressions
    );

  const previousImpressions =
    sumMetric(
      publishedContent,
      (asset) =>
        asset.previousPeriod
          ?.impressions
    );

  const currentViews =
    sumMetric(
      publishedContent,
      (asset) =>
        asset.currentPeriod?.views
    );

  const previousViews =
    sumMetric(
      publishedContent,
      (asset) =>
        asset.previousPeriod?.views
    );

  const currentSubscribers =
    sumMetric(
      publishedContent,
      (asset) =>
        asset.currentPeriod
          ?.subscribersGained
    );

  const previousSubscribers =
    sumMetric(
      publishedContent,
      (asset) =>
        asset.previousPeriod
          ?.subscribersGained
    );

  const currentCtr =
    calculateWeightedCtr(
      publishedContent
    );

  const previousCtr =
    calculateWeightedCtr(
      publishedContent.map(
        (asset) => ({
          ...asset,
          currentPeriod:
            asset.previousPeriod,
        })
      )
    );

  const currentSubscriberConversion =
    calculateSubscriberConversion({
      subscribersGained:
        currentSubscribers,
      views: currentViews,
    });

  const previousSubscriberConversion =
    calculateSubscriberConversion({
      subscribersGained:
        previousSubscribers,
      views: previousViews,
    });

  return {
    metrics: [
      {
        label: "Impressions",
        value: formatCompactNumber(
          currentImpressions
        ),
        trend: formatPercentChange(
          calculatePercentChange(
            currentImpressions,
            previousImpressions
          )
        ),
        detail:
          "How often YouTube showed your thumbnails to potential viewers.",
      },

      {
        label: "Click-Through Rate",
        value: formatPercent(
          currentCtr
        ),
        trend: formatPercentChange(
          calculatePercentChange(
            currentCtr,
            previousCtr
          )
        ),
        detail:
          "The share of impressions that became views.",
      },

      {
        label: "Views From Reach",
        value: formatCompactNumber(
          currentViews
        ),
        trend: formatPercentChange(
          calculatePercentChange(
            currentViews,
            previousViews
          )
        ),
        detail:
          "Views generated across your simulated published content.",
      },

      {
        label: "Subscriber Conversion",
        value: formatPercent(
          currentSubscriberConversion
        ),
        trend: formatPercentChange(
          calculatePercentChange(
            currentSubscriberConversion,
            previousSubscriberConversion
          )
        ),
        detail:
          "The share of viewers who converted into subscribers.",
      },
    ],

    overview: {
      label: "Reach Overview",
      text: `${formatCompactNumber(
        currentImpressions
      )} impressions generated ${formatCompactNumber(
        currentViews
      )} views across your recent published content.`,
    },
  };
}