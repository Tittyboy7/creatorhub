function formatCompactNumber(value) {
  return new Intl.NumberFormat(
    "en-US",
    {
      notation: "compact",
      maximumFractionDigits: 1,
    }
  ).format(value || 0);
}

function formatCurrency(value) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }
  ).format(value || 0);
}

function formatPercentChange(value) {
  const roundedValue =
    Math.round(value || 0);

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

function getStreamDays(days = []) {
  return days.filter(
    (day) =>
      day?.twitch?.streamedToday
  );
}

function sumMetric(
  days,
  getter
) {
  return days.reduce(
    (total, day) =>
      total +
      (getter(day) || 0),
    0
  );
}

function averageMetric(
  days,
  getter
) {
  if (!days.length) {
    return 0;
  }

  return (
    sumMetric(days, getter) /
    days.length
  );
}

function buildPeriodMetrics(
  days = []
) {
  const streamDays =
    getStreamDays(days);

  const peakViewers =
    streamDays.reduce(
      (highestPeak, day) =>
        Math.max(
          highestPeak,
          day.twitch
            ?.peakConcurrentViewers ||
            0
        ),
      0
    );

  const hoursStreamed =
    sumMetric(
      streamDays,
      (day) =>
        day.twitch.hoursStreamed
    );

  return {
    streams:
      streamDays.length,

    hoursStreamed,

    averageViewers:
      averageMetric(
        streamDays,
        (day) =>
          day.twitch
            .averageConcurrentViewers
      ),

    peakViewers,

    uniqueViewers:
      averageMetric(
        streamDays,
        (day) =>
          day.twitch
            .uniqueViewers
      ),

    followers:
      sumMetric(
        streamDays,
        (day) =>
          day.twitch.followersGained
      ),

    subscriptions:
      sumMetric(
        streamDays,
        (day) =>
          day.twitch.subscriptions
      ),

    revenue:
      sumMetric(
        streamDays,
        (day) =>
          day.twitch.revenue
      ),
  };
}

export default function buildTwitchPlatformHubCard({
  dailySimulation,
  creator,
} = {}) {
  const days =
    dailySimulation?.days || [];

  if (!days.length) {
    return null;
  }

  const currentPeriodDays =
    dailySimulation?.reporting
      ?.currentPeriodDays || 28;

  const currentDays =
    days.slice(
      -currentPeriodDays
    );

  const previousDays =
    days.slice(
      -currentPeriodDays * 2,
      -currentPeriodDays
    );

  const currentPeriod =
    buildPeriodMetrics(
      currentDays
    );

  const previousPeriod =
    buildPeriodMetrics(
      previousDays
    );

  const today =
    days[days.length - 1] ||
    null;

  const twitchToday =
    today?.twitch || null;

  const streamedToday =
    Boolean(
      twitchToday?.streamedToday
    );

  const todayStats = [
    {
      metricKey:
        "averageViewers",

      label:
        "Average Viewers",

      value:
        streamedToday
          ? formatCompactNumber(
              twitchToday
                .averageConcurrentViewers
            )
          : "—",

      trend:
        formatPercentChange(
          calculatePercentChange(
            currentPeriod
              .averageViewers,
            previousPeriod
              .averageViewers
          )
        ),
    },

    {
      metricKey:
        "followers",

      label:
        "Followers",

      value:
        streamedToday
          ? `+${formatCompactNumber(
              twitchToday
                .followersGained
            )}`
          : "—",

      trend:
        formatPercentChange(
          calculatePercentChange(
            currentPeriod.followers,
            previousPeriod.followers
          )
        ),
    },

    {
      metricKey:
        "subscriptions",

      label:
        "Subs",

      value:
        streamedToday
          ? formatCompactNumber(
              twitchToday
                .subscriptions
            )
          : "—",

      trend:
        formatPercentChange(
          calculatePercentChange(
            currentPeriod
              .subscriptions,
            previousPeriod
              .subscriptions
          )
        ),
    },

    {
      metricKey:
        "revenue",

      label:
        "Revenue",

      value:
        streamedToday
          ? formatCurrency(
              twitchToday.revenue
            )
          : "—",

      trend:
        formatPercentChange(
          calculatePercentChange(
            currentPeriod.revenue,
            previousPeriod.revenue
          )
        ),
    },

    {
      metricKey:
        "peakViewers",

      label:
        "Peak Viewers",

      value:
        streamedToday
          ? formatCompactNumber(
              twitchToday
                .peakConcurrentViewers
            )
          : "—",

      trend:
        formatPercentChange(
          calculatePercentChange(
            currentPeriod
              .peakViewers,
            previousPeriod
              .peakViewers
          )
        ),
    },

    {
      metricKey:
        "uniqueViewers",

      label:
        "Unique Viewers",

      value:
        streamedToday
          ? formatCompactNumber(
              twitchToday
                .uniqueViewers
            )
          : "—",

      trend:
        formatPercentChange(
          calculatePercentChange(
            currentPeriod
              .uniqueViewers,
            previousPeriod
              .uniqueViewers
          )
        ),
    },

    {
      metricKey:
        "hoursStreamed",

      label:
        "Hours Streamed",

      value:
        streamedToday
          ? `${Number(
              twitchToday
                .hoursStreamed || 0
            ).toFixed(1)}h`
          : "—",

      trend:
        formatPercentChange(
          calculatePercentChange(
            currentPeriod
              .hoursStreamed,
            previousPeriod
              .hoursStreamed
          )
        ),
    },
  ];

  const trendHistory =
    days.map((day) => ({
      date: day.date,

      metrics: {
        averageViewers:
          day.twitch
            ?.averageConcurrentViewers ||
          0,

        followers:
          day.twitch
            ?.followersGained || 0,

        subscriptions:
          day.twitch
            ?.subscriptions || 0,

        revenue:
          day.twitch?.revenue || 0,

        peakViewers:
          day.twitch
            ?.peakConcurrentViewers ||
          0,

        uniqueViewers:
          day.twitch
            ?.uniqueViewers || 0,

        hoursStreamed:
          day.twitch
            ?.hoursStreamed || 0,
      },

      streamedToday:
        Boolean(
          day.twitch?.streamedToday
        ),

      events:
        day.events?.map(
          (event) => ({
            type: event.type,
            label: event.label,
          })
        ) || [],
    }));

  return {
    streamedToday,

    summaryRevenue:
      streamedToday
        ? twitchToday?.revenue || 0
        : 0,

    todayStats,

    trendHistory,

    summaryLabel: "Last 28 Days",

    overallStats: [
      {
        label: "Avg Viewers",
        value:
          formatCompactNumber(
            currentPeriod
              .averageViewers
          ),
      },

      {
        label: "Peak Viewers",
        value:
          formatCompactNumber(
            currentPeriod
              .peakViewers
          ),
      },

      {
        label: "Streams · 28D",
        value:
          formatCompactNumber(
            currentPeriod.streams
          ),
      },

      {
        label: "Hours · 28D",
        value:
          formatCompactNumber(
            currentPeriod
              .hoursStreamed
          ),
      },
    ],
  };
}