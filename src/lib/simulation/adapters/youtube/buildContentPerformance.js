function formatCompactNumber(value) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatHours(value) {
  return `${formatCompactNumber(value)} hrs`;
}

function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

function formatPercentChange(value) {
  const roundedValue = Math.round(value);

  if (roundedValue > 0) {
    return `+${roundedValue}%`;
  }

  return `${roundedValue}%`;
}

export default function buildYouTubeContentPerformance({
  creator,
  signals,
}) {
  const youtube = creator?.platforms?.youtube;
  const youtubeSignals = signals?.youtube;

  if (!youtube?.currentPeriod || !youtubeSignals) {
    return null;
  }

  const current = youtube.currentPeriod;

  return {
    account: {
      name: youtube.accountName,
      handle: youtube.accountHandle,
      periodLabel: current.periodLabel,
    },

    metrics: [
      {
        label: "Views",
        value: formatCompactNumber(current.views),
        trend: formatPercentChange(
          youtubeSignals.viewsChange
        ),
      },
      {
        label: "Watch Time",
        value: formatHours(current.watchTimeHours),
        trend: formatPercentChange(
          youtubeSignals.watchTimeChange
        ),
      },
      {
        label: "Average View Duration",
        value: formatDuration(
          current.averageViewDurationSeconds
        ),
        trend: formatPercentChange(
          ((current.averageViewDurationSeconds -
            youtube.previousPeriod.averageViewDurationSeconds) /
            youtube.previousPeriod.averageViewDurationSeconds) *
            100
        ),
      },
      {
        label: "Videos Published",
        value: String(current.videosPublished),
        trend: formatPercentChange(
          ((current.videosPublished -
            youtube.previousPeriod.videosPublished) /
            youtube.previousPeriod.videosPublished) *
            100
        ),
      },
    ],

    summary: {
      label: "Insight Summary",
      text: `Views increased ${formatPercentChange(
        youtubeSignals.viewsChange
      )}, while watch time increased ${formatPercentChange(
        youtubeSignals.watchTimeChange
      )} compared with the previous reporting period.`,
    },

    insight: {
      accent: "violet",
      text: `Content momentum is strengthening. ${formatCompactNumber(
        current.views
      )} views generated ${formatHours(
        current.watchTimeHours
      )} of watch time during the last 28 days.`,
      actionLabel: "View Full Content Report",
    },
  };
}