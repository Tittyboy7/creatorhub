import simulateWeek from "./simulateWeek";

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

function sumMetric(weeks, metric) {
  return weeks.reduce(
    (total, week) =>
      total + (week?.[metric] || 0),
    0
  );
}

function buildPeriodSummary(weeks) {
  if (!weeks.length) {
    return null;
  }

  return {
    startWeek: weeks[0].weekIndex,
    endWeek:
      weeks[weeks.length - 1].weekIndex,

    views: sumMetric(weeks, "views"),

    watchTimeHours: sumMetric(
      weeks,
      "watchTimeHours"
    ),

    subscribersGained: sumMetric(
      weeks,
      "subscribersGained"
    ),

    subscribersLost: sumMetric(
      weeks,
      "subscribersLost"
    ),

    netSubscriberGrowth: sumMetric(
      weeks,
      "netSubscriberGrowth"
    ),

    revenue: sumMetric(weeks, "revenue"),
  };
}

export default function simulateHistory(
  creator,
  {
    totalWeeks = 8,
    currentPeriodWeeks = 4,
  } = {}
) {
  if (
    totalWeeks < 1 ||
    currentPeriodWeeks < 1
  ) {
    return null;
  }

  const weeks = [];
  let simulationState = null;

  for (
    let weekIndex = 1;
    weekIndex <= totalWeeks;
    weekIndex += 1
  ) {
    const week = simulateWeek(
      creator,
      weekIndex,
      simulationState
    );
 
    if (!week) {
      continue;
    }
 
    weeks.push(week);
    simulationState = week.nextState;
  }
 
  if (!weeks.length) {
    return null;
  }

  const safePeriodLength = Math.min(
    currentPeriodWeeks,
    weeks.length
  );

  const currentWeeks = weeks.slice(
    -safePeriodLength
  );

  const previousWeeks = weeks.slice(
    -safePeriodLength * 2,
    -safePeriodLength
  );

  const currentPeriod =
    buildPeriodSummary(currentWeeks);

  const previousPeriod =
    buildPeriodSummary(previousWeeks);

  const changes = previousPeriod
    ? {
        views: calculatePercentChange(
          currentPeriod.views,
          previousPeriod.views
        ),

        watchTimeHours:
          calculatePercentChange(
            currentPeriod.watchTimeHours,
            previousPeriod.watchTimeHours
          ),

        netSubscriberGrowth:
          calculatePercentChange(
            currentPeriod.netSubscriberGrowth,
            previousPeriod.netSubscriberGrowth
          ),

        revenue: calculatePercentChange(
          currentPeriod.revenue,
          previousPeriod.revenue
        ),
      }
    : null;

  return {
    weeks,
    currentPeriod,
    previousPeriod,
    changes,
  };
}