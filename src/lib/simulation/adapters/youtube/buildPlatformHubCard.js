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

function formatHours(value) {
  return `${formatCompactNumber(value)}h`;
}

function formatPercentChange(value) {
  const roundedValue = Math.round(value || 0);

  if (roundedValue > 0) {
    return `+${roundedValue}%`;
  }

  return `${roundedValue}%`;
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

function getYouTubeRevenue(week) {
  return (
    week?.revenueBreakdown?.youtube ??
    week?.revenue ??
    0
  );
}

export default function buildYouTubePlatformHubCard({
  platformData,
}) {
  if (!platformData?.currentPeriod) {
    return null;
  }

  const current =
    platformData.currentPeriod;

  const previous =
    platformData.previousPeriod;

  const dailyHistory =
    platformData.dailyHistory || [];

  const today =
    platformData.today || null;

  const history =
    platformData.generatedHistory || [];

  const latestWeek =
    history[history.length - 1] || null;

  const dailyViews = today
    ? today.views || 0
    : latestWeek
      ? Math.round(
          (latestWeek.views || 0) / 7
        )
      : 0;

  const dailySubscribers = today
    ? today.netSubscriberGrowth || 0
    : latestWeek
      ? Math.round(
          (latestWeek.netSubscriberGrowth || 0) /
            7
        )
      : 0;

  const dailyRevenue = today
    ? getYouTubeRevenue(today)
    : latestWeek
      ? Math.round(
          getYouTubeRevenue(latestWeek) / 7
        )
      : 0;

  const dailyWatchTime = today
    ? today.watchTimeHours || 0
    : latestWeek
      ? Math.round(
          (latestWeek.watchTimeHours || 0) /
            7
        )
      : 0;

  return {
    metricKey: "views",

    summaryRevenue:
      dailyRevenue,

    todayStats: [
      {
        label: "Views",
        value: formatCompactNumber(
          dailyViews
        ),
        trend: formatPercentChange(
          calculatePercentChange(
            current.views,
            previous?.views
          )
        ),
      },

      {
        metricKey: "subscribers",
        label: "Subscribers",
        value: `+${formatCompactNumber(
          Math.max(0, dailySubscribers)
        )}`,
        trend: formatPercentChange(
          calculatePercentChange(
            current.netSubscriberGrowth,
            previous?.netSubscriberGrowth
          )
        ),
      },

      {
        metricKey: "revenue",
        label: "Revenue",
        value: formatCurrency(
          dailyRevenue
        ),
        trend: formatPercentChange(
          calculatePercentChange(
            current.estimatedRevenue,
            previous?.estimatedRevenue
          )
        ),
      },

      {
        metricKey: "watchTime",
        label: "Watch Time",
        value: formatHours(
          dailyWatchTime
        ),
        trend: formatPercentChange(
          calculatePercentChange(
            current.watchTimeHours,
            previous?.watchTimeHours
          )
        ),
      },
    ],

    trendHistory:
      dailyHistory.map((day) => ({
        date: day.date,

        metrics: {
          views:
            day.views || 0,

          subscribers:
            day.netSubscriberGrowth || 0,

          revenue:
            getYouTubeRevenue(day),

          watchTime:
            day.watchTimeHours || 0,
        },

        events:
          day.events?.map((event) => ({
            type: event.type,
            label: event.label,
          })) || [],
      })),

    overallStats: [
      {
        label: "Views",
        value: formatCompactNumber(
          platformData.lifetime?.views
        ),
      },

      {
        label: "Subscribers",
        value: formatCompactNumber(
          platformData.lifetime?.subscribers
        ),
      },

      {
        label: "Videos",
        value: formatCompactNumber(
          platformData.lifetime
            ?.videosPublished
        ),
      },
    ],
  };
}