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

function sumRevenue(weeks = []) {
  return weeks.reduce(
    (total, week) =>
      total + getYouTubeRevenue(week),
    0
  );
}

export default function buildYouTubeRevenue({
  creator,
  signals,
}) {
  const youtube =
    creator?.platforms?.youtube;

  const youtubeSignals =
    signals?.youtube;

  if (
    !youtube?.currentPeriod ||
    !youtube?.previousPeriod ||
    !youtubeSignals
  ) {
    return null;
  }

  const generatedHistory =
    youtube.generatedHistory || [];

  const currentPeriodWeeks =
    youtube.reporting?.currentPeriodWeeks || 4;

  const currentWeeks =
    generatedHistory.slice(
      -currentPeriodWeeks
    );

  const previousWeeks =
    generatedHistory.slice(
      -currentPeriodWeeks * 2,
      -currentPeriodWeeks
    );

  const currentRevenue =
    currentWeeks.length > 0
      ? sumRevenue(currentWeeks)
      : youtube.currentPeriod
          .estimatedRevenue || 0;

  const previousRevenue =
    previousWeeks.length > 0
      ? sumRevenue(previousWeeks)
      : youtube.previousPeriod
          .estimatedRevenue || 0;

  const revenueChange =
    calculatePercentChange(
      currentRevenue,
      previousRevenue
    );

  const latestWeek =
    currentWeeks[
      currentWeeks.length - 1
    ] || null;

  const revenueToday = latestWeek
    ? Math.max(
        0,
        Math.round(
          getYouTubeRevenue(latestWeek) / 7
        )
      )
    : 0;

  const history =
    currentWeeks.map((week) => ({
      weekIndex: week.weekIndex,
      revenue: getYouTubeRevenue(week),
    }));

  return {
    totalRevenue: {
      label: "Estimated Revenue",
      value: formatCurrency(
        currentRevenue
      ),
      rawValue: currentRevenue,
      trend: formatPercentChange(
        revenueChange
      ),
      periodLabel: "Last 28 days",
    },

    revenueToday: {
      label: "Revenue Today",
      value: formatCurrency(
        revenueToday
      ),
      rawValue: revenueToday,
      detail:
        "Estimated YouTube revenue generated today.",
    },

    previousRevenue: {
      label: "Previous 28 Days",
      value: formatCurrency(
        previousRevenue
      ),
      rawValue: previousRevenue,
      detail:
        "The 28 days immediately before the current reporting period.",
    },

    history,

    summary: {
      label: "Revenue Overview",
      text: `YouTube generated ${formatCurrency(
        currentRevenue
      )} during the last 28 days.`,
    },
  };
}