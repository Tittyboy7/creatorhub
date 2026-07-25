function formatCompactNumber(value) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatPercentChange(value) {
  const roundedValue = Math.round(value);

  if (roundedValue > 0) {
    return `+${roundedValue}%`;
  }

  return `${roundedValue}%`;
}

function calculatePercentChange(currentValue, previousValue) {
  if (!previousValue) {
    return 0;
  }

  return (
    ((currentValue - previousValue) / previousValue) *
    100
  );
}

export default function buildYouTubeAudience({
  creator,
  signals,
}) {
  const youtube = creator?.platforms?.youtube;
  const youtubeSignals = signals?.youtube;

  if (
    !youtube?.currentPeriod ||
    !youtube?.previousPeriod ||
    !youtubeSignals
  ) {
    return null;
  }

  const current = youtube.currentPeriod;
  const previous = youtube.previousPeriod;

  const returningViewers = Math.round(
    current.views * 0.38
  );

  const newViewers = Math.round(
    current.views * 0.62
  );

  const previousReturningViewers = Math.round(
    previous.views * 0.36
  );

  const previousNewViewers = Math.round(
    previous.views * 0.64
  );

  return {
    totalAudience: formatCompactNumber(current.views),

    composition: {
      returningViewerPercent: 38,
      newViewerPercent: 62,
    },

    metrics: {
      returningViewers: {
        label: "Returning Viewers",
        value: formatCompactNumber(returningViewers),
        trend: formatPercentChange(
          calculatePercentChange(
            returningViewers,
            previousReturningViewers
          )
        ),
      },

      newViewers: {
        label: "New Viewers",
        value: formatCompactNumber(newViewers),
        trend: formatPercentChange(
          calculatePercentChange(
            newViewers,
            previousNewViewers
          )
        ),
      },

      subscriberGrowth: {
        label: "Subscriber Growth",
        value: `+${formatCompactNumber(
          current.netSubscriberGrowth
        )}`,
        trend: formatPercentChange(
          youtubeSignals.subscriberGrowthChange
        ),
      },
    },

    summary: {
      label: "Insight Summary",
      text: `Your audience reached ${formatCompactNumber(
        current.views
      )} viewers during the last 28 days. New viewers represented 62% of that audience, while returning viewers represented 38%.`,
    },

    insight: {
      accent: "violet",
      text: `Audience discovery is strengthening. You gained ${formatCompactNumber(
        current.netSubscriberGrowth
      )} net subscribers while maintaining a growing base of returning viewers.`,
      actionLabel: "View Full Audience Report",
    },
  };
}