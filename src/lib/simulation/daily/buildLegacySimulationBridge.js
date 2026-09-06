function normalizeWeek(week) {
  if (!week) {
    return null;
  }

  return {
    weekIndex:
      week.weekIndex,

    startDate:
      week.startDate,

    endDate:
      week.endDate,

    views:
      week.views || 0,

    watchTimeHours:
      week.watchTimeHours || 0,

    subscribersGained:
      week.subscribersGained || 0,

    subscribersLost:
      week.subscribersLost || 0,

    netSubscriberGrowth:
      week.netSubscriberGrowth || 0,

    revenue:
      week.revenue || 0,

    revenueBreakdown: {
      youtube:
        week.revenueBreakdown
          ?.youtube || 0,

      sponsorships:
        week.revenueBreakdown
          ?.sponsorships || 0,
    },
  };
}

function normalizePeriod(
  period,
  periodLabel
) {
  if (!period) {
    return null;
  }

  return {
    periodLabel,

    startDate:
      period.startDate,

    endDate:
      period.endDate,

    views:
      period.views || 0,

    watchTimeHours:
      period.watchTimeHours || 0,

    subscribersGained:
      period.subscribersGained || 0,

    subscribersLost:
      period.subscribersLost || 0,

    netSubscriberGrowth:
      period.netSubscriberGrowth || 0,

    revenue:
      period.revenue || 0,

    revenueBreakdown: {
      youtube:
        period.revenueBreakdown
          ?.youtube || 0,

      sponsorships:
        period.revenueBreakdown
          ?.sponsorships || 0,
    },
  };
}

export default function buildLegacySimulationBridge(
  dailySimulation
) {
  if (
    !dailySimulation ||
    !dailySimulation.days?.length
  ) {
    return null;
  }

  const weeks =
    (
      dailySimulation.weeklyHistory ||
      []
    )
      .map(normalizeWeek)
      .filter(Boolean);

  const currentPeriod =
    normalizePeriod(
      dailySimulation.currentPeriod,
      "Last 28 days"
    );

  const previousPeriod =
    normalizePeriod(
      dailySimulation.previousPeriod,
      "Previous 28 days"
    );

  if (
    !currentPeriod ||
    !previousPeriod
  ) {
    return null;
  }

  return {
    source:
      "daily-simulation-bridge",

    reporting: {
      totalDays:
        dailySimulation.reporting
          ?.totalDays || 365,

      currentPeriodDays:
        dailySimulation.reporting
          ?.currentPeriodDays || 28,

      startDate:
        dailySimulation.reporting
          ?.startDate,

      endDate:
        dailySimulation.reporting
          ?.endDate,

      currentPeriod: {
        startDate:
          currentPeriod.startDate,

        endDate:
          currentPeriod.endDate,
      },

      previousPeriod: {
        startDate:
          previousPeriod.startDate,

        endDate:
          previousPeriod.endDate,
      },

      /*
       * Legacy adapters still use this
       * to decide how many weekly points
       * represent the current period.
       */
      currentPeriodWeeks: 4,
    },

    today:
      dailySimulation.today,

    days:
      dailySimulation.days,

    weeks,

    currentPeriod,

    previousPeriod,

    changes:
      dailySimulation.changes,

    context:
      dailySimulation.context ||
      null,

    brief:
      dailySimulation.brief ||
      null,

    monthlyHistory:
      dailySimulation.monthlyHistory ||
      [],

    dailyHistory:
      dailySimulation.days,

    dailySimulation,
  };
}