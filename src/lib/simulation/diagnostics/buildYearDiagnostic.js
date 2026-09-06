function roundMomentum(value) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return null;
  }

  return Number(value.toFixed(3));
}

function buildWeekDiagnostic(week) {
  if (!week) {
    return null;
  }

  const baseline =
    week.nextState?.baseline || {};

  const momentum =
    week.momentum || {};

  return {
    week: week.weekIndex,

    performance: {
      views: week.views,
      watchTimeHours:
        week.watchTimeHours,
      subscribersGained:
        week.subscribersGained,
      subscribersLost:
        week.subscribersLost,
      netSubscriberGrowth:
        week.netSubscriberGrowth,
      totalRevenue:
        week.revenue,
      youtubeRevenue:
        week.revenueBreakdown
          ?.youtube || 0,
      sponsorshipRevenue:
        week.revenueBreakdown
          ?.sponsorships || 0,
    },

    baseline: {
      views:
        baseline.weeklyYouTubeViews,
      watchTimeHours:
        baseline.weeklyWatchTimeHours,
      subscribersGained:
        baseline.weeklySubscribersGained,
      subscribersLost:
        baseline.weeklySubscribersLost,
      youtubeRevenue:
        baseline.weeklyYouTubeRevenue,
    },

    momentum: {
      audience:
        roundMomentum(
          momentum.audience
        ),
      content:
        roundMomentum(
          momentum.content
        ),
      revenue:
        roundMomentum(
          momentum.revenue
        ),
      creator:
        roundMomentum(
          momentum.creator
        ),
      sponsorship:
        roundMomentum(
          momentum.sponsorship
        ),
      commerce:
        roundMomentum(
          momentum.commerce
        ),
    },

    events:
      week.events?.map(
        (event) => event.type
      ) || [],
  };
}

function getExtremeWeek(
  weeks,
  metric,
  direction = "highest"
) {
  if (!weeks.length) {
    return null;
  }

  return weeks.reduce(
    (selected, week) => {
      if (!selected) {
        return week;
      }

      const currentValue =
        week?.[metric] || 0;

      const selectedValue =
        selected?.[metric] || 0;

      if (
        direction === "lowest"
          ? currentValue <
            selectedValue
          : currentValue >
            selectedValue
      ) {
        return week;
      }

      return selected;
    },
    null
  );
}

export default function buildYearDiagnostic(
  simulation
) {
  const weeks =
    simulation?.weeks || [];

  if (!weeks.length) {
    return null;
  }

  const milestoneIndexes = [
    1,
    13,
    26,
    39,
    52,
  ];

  const milestones =
    milestoneIndexes
      .map((weekIndex) =>
        weeks.find(
          (week) =>
            week.weekIndex ===
            weekIndex
        )
      )
      .filter(Boolean)
      .map(buildWeekDiagnostic);

  const highestViewsWeek =
    getExtremeWeek(
      weeks,
      "views",
      "highest"
    );

  const lowestViewsWeek =
    getExtremeWeek(
      weeks,
      "views",
      "lowest"
    );

  const highestRevenueWeek =
    getExtremeWeek(
      weeks,
      "revenue",
      "highest"
    );

  return {
    totalWeeks: weeks.length,

    milestones,

    extremes: {
      highestViews:
        buildWeekDiagnostic(
          highestViewsWeek
        ),

      lowestViews:
        buildWeekDiagnostic(
          lowestViewsWeek
        ),

      highestRevenue:
        buildWeekDiagnostic(
          highestRevenueWeek
        ),
    },

    finalPeriod: {
      current:
        simulation.currentPeriod,
      previous:
        simulation.previousPeriod,
      changes:
        simulation.changes,
    },
  };
}