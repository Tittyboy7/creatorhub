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

function getStreamDays(
  days = []
) {
  return days.filter(
    (day) =>
      day?.twitch?.streamedToday
  );
}

function calculatePeriodSummary(
  days = []
) {
  const streamDays =
    getStreamDays(days);

  if (!days.length) {
    return null;
  }

  const totalHours =
    sumMetric(
      streamDays,
      (day) =>
        day.twitch.hoursStreamed
    );

  const totalUniqueViewers =
    sumMetric(
      streamDays,
      (day) =>
        day.twitch.uniqueViewers
    );

  const followersGained =
    sumMetric(
      streamDays,
      (day) =>
        day.twitch.followersGained
    );

  const subscriptions =
    sumMetric(
      streamDays,
      (day) =>
        day.twitch.subscriptions
    );

  const revenue =
    sumMetric(
      streamDays,
      (day) =>
        day.twitch.revenue
    );

  const averageConcurrentViewers =
    streamDays.length
      ? Math.round(
          sumMetric(
            streamDays,
            (day) =>
              day.twitch
                .averageConcurrentViewers
          ) /
            streamDays.length
        )
      : 0;

  const highestPeak =
    streamDays.reduce(
      (highest, day) =>
        Math.max(
          highest,
          day.twitch
            .peakConcurrentViewers ||
            0
        ),
      0
    );

  return {
    startDate:
      days[0]?.date || null,

    endDate:
      days[
        days.length - 1
      ]?.date || null,

    calendarDays:
      days.length,

    streams:
      streamDays.length,

    hoursStreamed:
      Number(
        totalHours.toFixed(1)
      ),

    averageHoursPerStream:
      streamDays.length
        ? Number(
            (
              totalHours /
              streamDays.length
            ).toFixed(2)
          )
        : 0,

    averageConcurrentViewers,

    peakConcurrentViewers:
      highestPeak,

    uniqueViewers:
      totalUniqueViewers,

    followersGained,

    subscriptions,

    revenue,
  };
}

function buildStreamSnapshot(
  day
) {
  if (!day?.twitch) {
    return null;
  }

  return {
    date:
      day.date,

    hoursStreamed:
      day.twitch.hoursStreamed,

    averageConcurrentViewers:
      day.twitch
        .averageConcurrentViewers,

    peakConcurrentViewers:
      day.twitch
        .peakConcurrentViewers,

    uniqueViewers:
      day.twitch.uniqueViewers,

    followersGained:
      day.twitch.followersGained,

    subscriptions:
      day.twitch.subscriptions,

    revenue:
      day.twitch.revenue,
  };
}

function getHighestStream(
  streamDays,
  getter
) {
  if (!streamDays.length) {
    return null;
  }

  return streamDays.reduce(
    (highest, day) =>
      getter(day) >
      getter(highest)
        ? day
        : highest
  );
}

export default function buildTwitchDiagnostic({
  dailySimulation,
  creator,
} = {}) {
  const days =
    dailySimulation?.days || [];

  if (!days.length) {
    return null;
  }

  const streamDays =
    getStreamDays(days);

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

  const reference =
    creator?.platforms?.twitch
      ?.currentPeriod || null;

  const milestoneIndexes = [
    0,
    Math.floor(
      streamDays.length * 0.25
    ),
    Math.floor(
      streamDays.length * 0.5
    ),
    Math.floor(
      streamDays.length * 0.75
    ),
    streamDays.length - 1,
  ];

  const milestones =
    [
      ...new Set(
        milestoneIndexes
      ),
    ]
      .filter(
        (index) =>
          index >= 0 &&
          index <
            streamDays.length
      )
      .map(
        (index) =>
          buildStreamSnapshot(
            streamDays[index]
          )
      );

  const highestAverageViewers =
    getHighestStream(
      streamDays,
      (day) =>
        day.twitch
          .averageConcurrentViewers ||
        0
    );

  const highestPeakViewers =
    getHighestStream(
      streamDays,
      (day) =>
        day.twitch
          .peakConcurrentViewers ||
        0
    );

  const highestRevenue =
    getHighestStream(
      streamDays,
      (day) =>
        day.twitch.revenue || 0
    );

  return {
    totalCalendarDays:
      days.length,

    totalStreams:
      streamDays.length,

    referencePeriod:
      reference
        ? {
            streams:
              reference.streams,

            hoursStreamed:
              reference.hoursStreamed,

            averageConcurrentViewers:
              reference
                .averageConcurrentViewers,

            peakConcurrentViewers:
              reference
                .peakConcurrentViewers,

            uniqueViewers:
              reference.uniqueViewers,

            followersGained:
              reference.followersGained,

            subscriptions:
              reference.subscriptions,

            revenue:
              reference
                .estimatedRevenue,
          }
        : null,

    currentPeriod:
      calculatePeriodSummary(
        currentDays
      ),

    previousPeriod:
      calculatePeriodSummary(
        previousDays
      ),

    milestones,

    extremes: {
      highestAverageViewers:
        buildStreamSnapshot(
          highestAverageViewers
        ),

      highestPeakViewers:
        buildStreamSnapshot(
          highestPeakViewers
        ),

      highestRevenue:
        buildStreamSnapshot(
          highestRevenue
        ),
    },
  };
}