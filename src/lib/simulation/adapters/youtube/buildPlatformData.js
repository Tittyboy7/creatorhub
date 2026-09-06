import gamingStreamerContent from "@/lib/simulation/content/youtube/gamingStreamerContent";
import buildContentSimulation from "@/lib/simulation/content/engine/buildContentSimulation";

function formatCompactNumber(value) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatPercentChange(value) {
  const roundedValue = Math.round(value || 0);

  if (roundedValue > 0) {
    return `+${roundedValue}%`;
  }

  return `${roundedValue}%`;
}

function buildSnapshotMetrics({
  simulation,
}) {
  const weeks =
    simulation?.weeks || [];

  const currentPeriodWeeks =
    simulation?.reporting
      ?.currentPeriodWeeks || 4;

  const currentWeeks =
    weeks.slice(-currentPeriodWeeks);

  const previousWeeks =
    weeks.slice(
      -currentPeriodWeeks * 2,
      -currentPeriodWeeks
    );

  const latestWeek =
    currentWeeks[
      currentWeeks.length - 1
    ] || null;

  if (!latestWeek) {
    return [];
  }

  function sumMetric(periodWeeks, getter) {
    return periodWeeks.reduce(
      (total, week) =>
        total + (getter(week) || 0),
      0
    );
  }

  function percentChange(
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

  const currentViews =
    sumMetric(
      currentWeeks,
      (week) => week.views
    );

  const previousViews =
    sumMetric(
      previousWeeks,
      (week) => week.views
    );

  const currentWatchTime =
    sumMetric(
      currentWeeks,
      (week) => week.watchTimeHours
    );

  const previousWatchTime =
    sumMetric(
      previousWeeks,
      (week) => week.watchTimeHours
    );

  const currentSubscribers =
    sumMetric(
      currentWeeks,
      (week) => week.netSubscriberGrowth
    );

  const previousSubscribers =
    sumMetric(
      previousWeeks,
      (week) => week.netSubscriberGrowth
    );

  const currentRevenue =
    sumMetric(
      currentWeeks,
      (week) =>
        week.revenueBreakdown?.youtube ??
        week.revenue
    );

  const previousRevenue =
    sumMetric(
      previousWeeks,
      (week) =>
        week.revenueBreakdown?.youtube ??
        week.revenue
    );

  return [
    {
      id: "revenue-today",
      label: "Revenue Today",
      value: formatCurrency(
        (latestWeek.revenueBreakdown
          ?.youtube ??
          latestWeek.revenue ??
          0) / 7
      ),
      trend: formatPercentChange(
        percentChange(
          currentRevenue,
          previousRevenue
        )
      ),
      history: currentWeeks.map(
        (week) =>
          week.revenueBreakdown
            ?.youtube ??
          week.revenue ??
          0
      ),
    },

    {
      id: "views-today",
      label: "Views Today",
      value: formatCompactNumber(
        (latestWeek.views || 0) / 7
      ),
      trend: formatPercentChange(
        percentChange(
          currentViews,
          previousViews
        )
      ),
      history: currentWeeks.map(
        (week) => week.views || 0
      ),
    },

    {
      id: "subscribers-today",
      label: "Subscribers Today",
      value: `+${formatCompactNumber(
        Math.max(
          0,
          (latestWeek.netSubscriberGrowth ||
            0) / 7
        )
      )}`,
      trend: formatPercentChange(
        percentChange(
          currentSubscribers,
          previousSubscribers
        )
      ),
      history: currentWeeks.map(
        (week) =>
          week.netSubscriberGrowth || 0
      ),
    },

    {
      id: "watch-time-today",
      label: "Watch Time Today",
      value: `${formatCompactNumber(
        (latestWeek.watchTimeHours || 0) /
          7
      )}h`,
      trend: formatPercentChange(
        percentChange(
          currentWatchTime,
          previousWatchTime
        )
      ),
      history: currentWeeks.map(
        (week) =>
          week.watchTimeHours || 0
      ),
    },
  ];
}

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
      generatedPeriod.revenueBreakdown
        ?.youtube ??
      generatedPeriod.revenue ??
      0,

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

  const snapshotMetrics =
    buildSnapshotMetrics({
      simulation,
    });

  const simulatedContent =
    buildContentSimulation({
      creator,
      simulation,
      content: gamingStreamerContent,
    });

  return {
    ...youtube,

    dataSource:
      simulation.today
        ? "daily-simulation"
        : "simulation",

    snapshotMetrics,

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

    content: simulatedContent,

    today:
      simulation.today || null,

    dailyHistory:
      simulation.dailyHistory ||
      simulation.days ||
      [],

    generatedHistory:
      simulation.weeks || [],

    monthlyHistory:
      simulation.monthlyHistory || [],

    reporting:
      simulation.reporting || null,

    changes:
      simulation.changes || null,

    context:
      simulation.context || null,

    brief:
      simulation.brief || null,
  };
}