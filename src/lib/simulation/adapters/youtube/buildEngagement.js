function formatCompactNumber(value) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);
}

function formatHours(value) {
  return `${formatCompactNumber(value)} hrs`;
}

function formatDuration(totalSeconds) {
  const safeSeconds = Math.max(
    0,
    Math.round(totalSeconds || 0)
  );

  const minutes = Math.floor(
    safeSeconds / 60
  );

  const seconds =
    safeSeconds % 60;

  return `${minutes}m ${String(
    seconds
  ).padStart(2, "0")}s`;
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
  const roundedValue = Math.round(
    value || 0
  );

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

function calculateWeightedDuration(
  content,
  periodKey
) {
  const totalViews = sumMetric(
    content,
    (asset) =>
      asset?.[periodKey]?.views
  );

  if (!totalViews) {
    return 0;
  }

  const weightedDuration =
    content.reduce(
      (total, asset) => {
        const period =
          asset?.[periodKey] || {};

        return (
          total +
          (period.views || 0) *
            (period.averageViewDurationSeconds ||
              0)
        );
      },
      0
    );

  return weightedDuration / totalViews;
}

function calculateEngagementRate({
  likes,
  comments,
  views,
}) {
  if (!views) {
    return 0;
  }

  return (
    ((likes + comments) / views) *
    100
  );
}

export default function buildYouTubeEngagement({
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

  const currentWatchTime =
    sumMetric(
      publishedContent,
      (asset) =>
        asset.currentPeriod
          ?.watchTimeHours
    );

  const previousWatchTime =
    sumMetric(
      publishedContent,
      (asset) =>
        asset.previousPeriod
          ?.watchTimeHours
    );

  const currentLikes =
    sumMetric(
      publishedContent,
      (asset) =>
        asset.currentPeriod?.likes
    );

  const previousLikes =
    sumMetric(
      publishedContent,
      (asset) =>
        asset.previousPeriod?.likes
    );

  const currentComments =
    sumMetric(
      publishedContent,
      (asset) =>
        asset.currentPeriod?.comments
    );

  const previousComments =
    sumMetric(
      publishedContent,
      (asset) =>
        asset.previousPeriod
          ?.comments
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

  const currentAverageDuration =
    calculateWeightedDuration(
      publishedContent,
      "currentPeriod"
    );

  const previousAverageDuration =
    calculateWeightedDuration(
      publishedContent,
      "previousPeriod"
    );

  const currentEngagementRate =
    calculateEngagementRate({
      likes: currentLikes,
      comments: currentComments,
      views: currentViews,
    });

  const previousEngagementRate =
    calculateEngagementRate({
      likes: previousLikes,
      comments: previousComments,
      views: previousViews,
    });

  return {
    metrics: [
      {
        label: "Watch Time",
        value: formatHours(
          currentWatchTime
        ),
        trend: formatPercentChange(
          calculatePercentChange(
            currentWatchTime,
            previousWatchTime
          )
        ),
        detail:
          "Total watch time generated across recent published content.",
      },

      {
        label: "Average View Duration",
        value: formatDuration(
          currentAverageDuration
        ),
        trend: formatPercentChange(
          calculatePercentChange(
            currentAverageDuration,
            previousAverageDuration
          )
        ),
        detail:
          "Average time viewers spent watching each view.",
      },

      {
        label: "Likes + Comments",
        value: formatCompactNumber(
          currentLikes +
            currentComments
        ),
        trend: formatPercentChange(
          calculatePercentChange(
            currentLikes +
              currentComments,
            previousLikes +
              previousComments
          )
        ),
        detail:
          "Combined likes and comments across recent content.",
      },

      {
        label: "Engagement Rate",
        value: formatPercent(
          currentEngagementRate
        ),
        trend: formatPercentChange(
          calculatePercentChange(
            currentEngagementRate,
            previousEngagementRate
          )
        ),
        detail:
          "Likes and comments as a share of total views.",
      },
    ],

    overview: {
      label: "Engagement Overview",
      text: `${formatCompactNumber(
        currentLikes +
          currentComments
      )} likes and comments were generated across your recent published content.`,
    },
  };
}