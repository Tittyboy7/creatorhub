import simulateDay from "./simulateDay";

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

function sumMetric(
  days,
  getter
) {
  return days.reduce(
    (total, day) =>
      total + (getter(day) || 0),
    0
  );
}

function buildPeriodSummary(days = []) {
  if (!days.length) {
    return null;
  }

  const firstDay = days[0];

  const lastDay =
    days[days.length - 1];

  const youtubeRevenue =
    sumMetric(
      days,
      (day) =>
        day.revenueBreakdown
          ?.youtube || 0
    );

  const sponsorshipRevenue =
    sumMetric(
      days,
      (day) =>
        day.revenueBreakdown
          ?.sponsorships || 0
    );

  return {
    startDay:
      firstDay.dayIndex,

    endDay:
      lastDay.dayIndex,

    startDate:
      firstDay.date,

    endDate:
      lastDay.date,

    totalDays:
      days.length,

    views:
      sumMetric(
        days,
        (day) => day.views
      ),

    watchTimeHours:
      sumMetric(
        days,
        (day) =>
          day.watchTimeHours
      ),

    subscribersGained:
      sumMetric(
        days,
        (day) =>
          day.subscribersGained
      ),

    subscribersLost:
      sumMetric(
        days,
        (day) =>
          day.subscribersLost
      ),

    netSubscriberGrowth:
      sumMetric(
        days,
        (day) =>
          day.netSubscriberGrowth
      ),

    revenue:
      sumMetric(
        days,
        (day) => day.revenue
      ),

    revenueBreakdown: {
      youtube:
        youtubeRevenue,

      sponsorships:
        sponsorshipRevenue,
    },
  };
}

function buildChanges({
  currentPeriod,
  previousPeriod,
}) {
  if (
    !currentPeriod ||
    !previousPeriod
  ) {
    return null;
  }

  return {
    views:
      calculatePercentChange(
        currentPeriod.views,
        previousPeriod.views
      ),

    watchTimeHours:
      calculatePercentChange(
        currentPeriod
          .watchTimeHours,
        previousPeriod
          .watchTimeHours
      ),

    netSubscriberGrowth:
      calculatePercentChange(
        currentPeriod
          .netSubscriberGrowth,
        previousPeriod
          .netSubscriberGrowth
      ),

    revenue:
      calculatePercentChange(
        currentPeriod.revenue,
        previousPeriod.revenue
      ),

    youtubeRevenue:
      calculatePercentChange(
        currentPeriod
          .revenueBreakdown
          ?.youtube,
        previousPeriod
          .revenueBreakdown
          ?.youtube
      ),
  };
}

function buildWeeklyHistory(
  days = []
) {
  const groups =
    new Map();

  days.forEach((day) => {
    const weekIndex =
      day.weekIndex;

    if (
      !groups.has(weekIndex)
    ) {
      groups.set(
        weekIndex,
        []
      );
    }

    groups
      .get(weekIndex)
      .push(day);
  });

  return Array.from(
    groups.entries()
  ).map(
    ([
      weekIndex,
      weekDays,
    ]) => ({
      weekIndex,

      ...buildPeriodSummary(
        weekDays
      ),
    })
  );
}

function buildMonthlyHistory(
  days = []
) {
  const groups =
    new Map();

  days.forEach((day) => {
    const monthKey =
      day.date?.slice(0, 7);

    if (!monthKey) {
      return;
    }

    if (
      !groups.has(monthKey)
    ) {
      groups.set(
        monthKey,
        []
      );
    }

    groups
      .get(monthKey)
      .push(day);
  });

  return Array.from(
    groups.entries()
  ).map(
    ([
      monthKey,
      monthDays,
    ]) => ({
      monthKey,

      ...buildPeriodSummary(
        monthDays
      ),
    })
  );
}

export default function simulateDailyHistory({
  creator,
  dailyProfile,
  schedule,
  currentPeriodDays = 28,
}) {
  const scheduledDays =
    schedule?.days || [];

  if (
    !creator ||
    !dailyProfile ||
    !scheduledDays.length ||
    currentPeriodDays < 1
  ) {
    return null;
  }

  const days = [];

  let simulationState =
    null;

  for (
    const scheduledDay
    of scheduledDays
  ) {
    const day =
      simulateDay({
        creator,
        dailyProfile,
        day: scheduledDay,
        previousState:
          simulationState,
      });

    if (!day) {
      continue;
    }

    days.push(day);

    simulationState =
      day.nextState;
  }

  if (!days.length) {
    return null;
  }

  const safePeriodLength =
    Math.min(
      currentPeriodDays,
      days.length
    );

  const currentDays =
    days.slice(
      -safePeriodLength
    );

  const previousDays =
    days.slice(
      -safePeriodLength * 2,
      -safePeriodLength
    );

  const last7Days =
    buildPeriodSummary(
      days.slice(-7)
    );

  const last28Days =
    buildPeriodSummary(
      days.slice(-28)
    );

  const last90Days =
    buildPeriodSummary(
      days.slice(-90)
    );

  const currentPeriod =
    buildPeriodSummary(
      currentDays
    );

  const previousPeriod =
    buildPeriodSummary(
      previousDays
    );

  const changes =
    buildChanges({
      currentPeriod,
      previousPeriod,
    });

  const today =
    days[
      days.length - 1
    ];

  return {
    source:
      "daily-simulation",

    totalDays:
      days.length,

    startDate:
      days[0].date,

    endDate:
      today.date,

    today,

    periods: {
      last7Days,
      last28Days,
      last90Days,

      current:
        currentPeriod,

      previous:
        previousPeriod,
    },

    currentPeriod,
    previousPeriod,
    changes,

    days,

    weeklyHistory:
      buildWeeklyHistory(
        days
      ),

    monthlyHistory:
      buildMonthlyHistory(
        days
      ),

    finalState:
      simulationState,
  };
}