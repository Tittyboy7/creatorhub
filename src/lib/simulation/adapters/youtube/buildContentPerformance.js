function formatCompactNumber(value) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatHours(value) {
  return `${formatCompactNumber(value)} hrs`;
}

function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}m ${String(seconds).padStart(
    2,
    "0"
  )}s`;
}

function calculateAverageViewDuration({
  watchTimeHours,
  views,
}) {
  if (!views || !watchTimeHours) {
    return 0;
  }

  return Math.max(
    0,
    Math.round(
      (watchTimeHours * 60 * 60) /
        views
    )
  );
}

function formatPercentChange(value) {
  const roundedValue = Math.round(value);

  if (roundedValue > 0) {
    return `+${roundedValue}%`;
  }

  return `${roundedValue}%`;
}

function calculateAverage(values) {
  if (!values.length) {
    return 0;
  }

  const total = values.reduce(
    (sum, value) => sum + value,
    0
  );

  return total / values.length;
}

function buildContentItem(asset) {
  if (!asset) {
    return null;
  }

  const currentPeriod =
    asset.currentPeriod || {};

  return {
    id: asset.id,
    label: "Recent Upload",
    title: asset.title,
    assetType: asset.assetType,
    publishedAt: asset.publishedAt,

    metric: `${formatCompactNumber(
      currentPeriod.views || 0
    )} views`,

    views: currentPeriod.views || 0,

    watchTimeHours:
      currentPeriod.watchTimeHours || 0,

    clickThroughRate:
      currentPeriod.clickThroughRate || 0,

    averageViewDurationSeconds:
      currentPeriod.averageViewDurationSeconds || 0,

    subscribersGained:
      currentPeriod.subscribersGained || 0,

    estimatedRevenue:
      currentPeriod.estimatedRevenue || 0,

    assessment:
      asset.assessment || null,

    recommendation:
      asset.businessContext
        ?.recommendation || null,

    platformData:
      asset.platformData || {},
  };
}

function buildRankedContent(content = []) {
  const publishedContent = content.filter(
    (asset) =>
      asset?.status === "published" &&
      asset?.currentPeriod
  );

  const byViews = [...publishedContent].sort(
    (firstAsset, secondAsset) =>
      (secondAsset.currentPeriod?.views || 0) -
      (firstAsset.currentPeriod?.views || 0)
  );

  const byWatchTime = [
    ...publishedContent,
  ].sort(
    (firstAsset, secondAsset) =>
      (secondAsset.currentPeriod
        ?.watchTimeHours || 0) -
      (firstAsset.currentPeriod
        ?.watchTimeHours || 0)
  );

  const byEngagement = [
    ...publishedContent,
  ].sort((firstAsset, secondAsset) => {
    const firstEngagement =
      (firstAsset.currentPeriod?.likes || 0) +
      (firstAsset.currentPeriod?.comments || 0);

    const secondEngagement =
      (secondAsset.currentPeriod?.likes || 0) +
      (secondAsset.currentPeriod?.comments || 0);

    return (
      secondEngagement - firstEngagement
    );
  });

  const newestFirst = [
    ...publishedContent,
  ].sort(
    (firstAsset, secondAsset) =>
      new Date(secondAsset.publishedAt).getTime() -
      new Date(firstAsset.publishedAt).getTime()
  );

  return {
    topPerformer:
      buildContentItem(byViews[0]),

    watchTimeLeader:
      buildContentItem(byWatchTime[0]),

    engagementLeader:
      buildContentItem(byEngagement[0]),

    underperformer:
      buildContentItem(
        byViews[byViews.length - 1]
      ),

    recentUploads: newestFirst
      .slice(0, 5)
      .map(buildContentItem)
      .filter(Boolean),
  };
}

function buildFeaturedContent(content = []) {
  const publishedContent = content.filter(
    (asset) =>
      asset.status === "published" &&
      asset.currentPeriod
  );

  if (!publishedContent.length) {
    return null;
  }

  const rankedContent = [...publishedContent].sort(
    (firstAsset, secondAsset) =>
      (secondAsset.currentPeriod?.views || 0) -
      (firstAsset.currentPeriod?.views || 0)
  );

  const topAsset = rankedContent[0];

  const averageViews = calculateAverage(
    publishedContent.map(
      (asset) =>
        asset.currentPeriod?.views || 0
    )
  );

  const performanceDifference =
    averageViews > 0
      ? ((topAsset.currentPeriod.views -
          averageViews) /
          averageViews) *
        100
      : 0;

  return {
    id: topAsset.id,
    label: "Top Content",
    title: topAsset.title,

    metric: `${formatCompactNumber(
      topAsset.currentPeriod.views
    )} views · ${formatHours(
      topAsset.currentPeriod.watchTimeHours
    )} watch time`,

    comparison: `${formatPercentChange(
      performanceDifference
    )} vs recent upload average`,

    assessment: topAsset.assessment || null,

    recommendation:
      topAsset.businessContext
        ?.recommendation || null,

    assetType: topAsset.assetType,

    publishedAt: topAsset.publishedAt,

    platformData: topAsset.platformData,
  };
}

export default function buildYouTubeContentPerformance({
  creator,
  signals,
}) {
  const youtube = creator?.platforms?.youtube;
  const youtubeSignals = signals?.youtube;

  if (
    !youtube?.currentPeriod ||
    !youtubeSignals
  ) {
    return null;
  }

  const current = youtube.currentPeriod;

  const generatedHistory =
    youtube.generatedHistory || [];

  const currentPeriodWeeks =
    youtube.reporting
      ?.currentPeriodWeeks || 4;

  const currentHistory =
    generatedHistory.slice(
      -currentPeriodWeeks
    );

  const history = {
    views: currentHistory.map(
      (week) => week.views || 0
    ),

    watchTimeHours:
      currentHistory.map(
        (week) =>
          week.watchTimeHours || 0
      ),

    averageViewDurationSeconds:
      currentHistory.map((week) =>
        calculateAverageViewDuration({
          watchTimeHours:
            week.watchTimeHours,
          views: week.views,
        })
      ),
  };

  const featuredContent =
    buildFeaturedContent(youtube.content);

  const rankedContent =
    buildRankedContent(youtube.content);

  return {
    account: {
      name: youtube.accountName,
      handle: youtube.accountHandle,
      periodLabel: current.periodLabel,
    },

    featuredContent,

    rankedContent,

    metrics: [
      {
        label: "Views",
        value: formatCompactNumber(
          current.views
        ),
        trend: formatPercentChange(
          youtubeSignals.viewsChange
        ),
        history:
          history.views,
      },
      {
        label: "Watch Time",
        value: formatHours(
          current.watchTimeHours
        ),
        trend: formatPercentChange(
          youtubeSignals.watchTimeChange
        ),
        history:
          history.watchTimeHours,
      },
      {
        label: "Average View Duration",
        value: formatDuration(
          current.averageViewDurationSeconds
        ),
        trend: formatPercentChange(
          ((current.averageViewDurationSeconds -
            youtube.previousPeriod
              .averageViewDurationSeconds) /
            youtube.previousPeriod
              .averageViewDurationSeconds) *
            100
        ),
        history:
          history.averageViewDurationSeconds,
      },
      {
        label: "Videos Published",
        value: String(
          current.videosPublished
        ),
        trend: formatPercentChange(
          ((current.videosPublished -
            youtube.previousPeriod
              .videosPublished) /
            youtube.previousPeriod
              .videosPublished) *
            100
        ),
      },
    ],

    summary: {
      label: "Content Overview",

      text: featuredContent
        ? `${featuredContent.title} is currently your strongest recent upload, performing ${featuredContent.comparison}.`
        : `Views increased ${formatPercentChange(
            youtubeSignals.viewsChange
          )}, while watch time increased ${formatPercentChange(
            youtubeSignals.watchTimeChange
          )} compared with the previous reporting period.`,
    },

    insight: {
      accent: "violet",

      text: featuredContent
        ? `${featuredContent.title} is leading recent content performance with ${featuredContent.metric}.`
        : `Content momentum is strengthening. ${formatCompactNumber(
            current.views
          )} views generated ${formatHours(
            current.watchTimeHours
          )} of watch time during the last 28 days.`,

      actionLabel: "View Full Content Report",
    },
  };
}