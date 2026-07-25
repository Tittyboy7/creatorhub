function calculateAverageViewDuration({
  watchTimeHours,
  views,
  fallbackSeconds = 0,
}) {
  if (!views || !watchTimeHours) {
    return fallbackSeconds;
  }

  const totalWatchTimeSeconds =
    watchTimeHours * 60 * 60;

  return Math.max(
    0,
    Math.round(totalWatchTimeSeconds / views)
  );
}

function buildReportingPeriod({
  generatedPeriod,
  fallbackPeriod,
  periodLabel,
}) {
  if (!generatedPeriod) {
    return fallbackPeriod || null;
  }

  return {
    periodLabel,

    views: generatedPeriod.views || 0,

    watchTimeHours:
      generatedPeriod.watchTimeHours || 0,

    subscribersGained:
      generatedPeriod.subscribersGained || 0,

    subscribersLost:
      generatedPeriod.subscribersLost || 0,

    netSubscriberGrowth:
      generatedPeriod.netSubscriberGrowth || 0,

    estimatedRevenue:
      generatedPeriod.revenue || 0,

    averageViewDurationSeconds:
      calculateAverageViewDuration({
        watchTimeHours:
          generatedPeriod.watchTimeHours,
        views: generatedPeriod.views,
        fallbackSeconds:
          fallbackPeriod
            ?.averageViewDurationSeconds || 0,
      }),

    videosPublished:
      fallbackPeriod?.videosPublished || 0,

    clickThroughRate:
      fallbackPeriod?.clickThroughRate || 0,
  };
}

export default function buildYouTubePlatformData({
  creator,
  simulation,
}) {
  const youtube =
    creator?.platforms?.youtube;

  if (
    !youtube ||
    !simulation?.currentPeriod ||
    !simulation?.previousPeriod
  ) {
    return null;
  }

  return {
    ...youtube,

    dataSource: "simulation",

    accountId:
      youtube.accountId ||
      "youtube-primary",

    isPrimary:
      youtube.isPrimary !== false,

    accountName: youtube.accountName,
    accountHandle: youtube.accountHandle,

    lifetime: {
      ...youtube.lifetime,
    },

    currentPeriod: buildReportingPeriod({
      generatedPeriod:
        simulation.currentPeriod,

      fallbackPeriod:
        youtube.currentPeriod,

      periodLabel: "Last 28 days",
    }),

    previousPeriod: buildReportingPeriod({
      generatedPeriod:
        simulation.previousPeriod,

      fallbackPeriod:
        youtube.previousPeriod,

      periodLabel: "Previous 28 days",
    }),

    generatedHistory:
      simulation.weeks || [],

    changes:
      simulation.changes || null,

    context:
      simulation.context || null,

    brief:
      simulation.brief || null,
  };
}