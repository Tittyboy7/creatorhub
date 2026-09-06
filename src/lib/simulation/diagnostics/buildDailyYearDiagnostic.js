function roundValue(
  value,
  digits = 3
) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return null;
  }

  return Number(
    value.toFixed(digits)
  );
}

function buildDayDiagnostic(day) {
  if (!day) {
    return null;
  }

  const baseline =
    day.nextState?.baseline || {};

  const momentum =
    day.momentum || {};

  return {
    day:
      day.dayIndex,

    date:
      day.date,

    dayName:
      day.dayName,

    activity: {
      scheduledUpload:
        day.scheduledUpload,

      scheduledStream:
        day.scheduledStream,
    },

    performance: {
      views:
        day.views,

      watchTimeHours:
        day.watchTimeHours,

      averageViewDurationSeconds:
        day.averageViewDurationSeconds,

      subscribersGained:
        day.subscribersGained,

      subscribersLost:
        day.subscribersLost,

      netSubscriberGrowth:
        day.netSubscriberGrowth,

      totalRevenue:
        day.revenue,

      youtubeRevenue:
        day.revenueBreakdown
          ?.youtube || 0,

      sponsorshipRevenue:
        day.revenueBreakdown
          ?.sponsorships || 0,
    },

    baseline: {
      views:
        roundValue(
          baseline.dailyYouTubeViews,
          1
        ),

      subscribersGained:
        roundValue(
          baseline.dailySubscribersGained,
          1
        ),

      subscribersLost:
        roundValue(
          baseline.dailySubscribersLost,
          1
        ),

      youtubeRevenue:
        roundValue(
          baseline.dailyYouTubeRevenue,
          1
        ),
    },

    momentum: {
      audience:
        roundValue(
          momentum.audience
        ),

      content:
        roundValue(
          momentum.content
        ),

      revenue:
        roundValue(
          momentum.revenue
        ),

      creator:
        roundValue(
          momentum.creator
        ),

      sponsorship:
        roundValue(
          momentum.sponsorship
        ),

      commerce:
        roundValue(
          momentum.commerce
        ),
    },

    events:
      day.events?.map(
        (event) =>
          event.type
      ) || [],
  };
}

function getExtremeDay(
  days,
  getter,
  direction = "highest"
) {
  if (!days.length) {
    return null;
  }

  return days.reduce(
    (selected, day) => {
      if (!selected) {
        return day;
      }

      const currentValue =
        getter(day) || 0;

      const selectedValue =
        getter(selected) || 0;

      if (
        direction === "lowest"
          ? currentValue <
            selectedValue
          : currentValue >
            selectedValue
      ) {
        return day;
      }

      return selected;
    },
    null
  );
}

function countEvents(
  days,
  eventType
) {
  return days.reduce(
    (total, day) =>
      total +
      (
        day.events?.some(
          (event) =>
            event.type ===
            eventType
        )
          ? 1
          : 0
      ),
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

  const total =
    days.reduce(
      (sum, day) =>
        sum +
        (getter(day) || 0),
      0
    );

  return total / days.length;
}

function getMaximumMomentum(
  days,
  key
) {
  return days.reduce(
    (maximum, day) =>
      Math.max(
        maximum,
        day.momentum?.[key] ||
          0
      ),
    0
  );
}

export default function buildDailyYearDiagnostic(
  simulation
) {
  const days =
    simulation?.days || [];

  if (!days.length) {
    return null;
  }

  const milestoneIndexes = [
    1,
    30,
    90,
    180,
    270,
    365,
  ];

  const milestones =
    milestoneIndexes
      .map((dayIndex) =>
        days.find(
          (day) =>
            day.dayIndex ===
            dayIndex
        )
      )
      .filter(Boolean)
      .map(
        buildDayDiagnostic
      );

  const uploadDays =
    days.filter(
      (day) =>
        day.scheduledUpload
    );

  const streamDays =
    days.filter(
      (day) =>
        day.scheduledStream
    );

  const ordinaryDays =
    days.filter(
      (day) =>
        !day.scheduledUpload &&
        !day.scheduledStream
    );

  const publishedUploadDays =
    days.filter((day) =>
      day.events?.some(
        (event) =>
          event.type ===
          "content_published"
      )
    );

  const missedUploadDays =
    days.filter((day) =>
      day.events?.some(
        (event) =>
          event.type ===
          "missed_upload"
      )
    );

  const highestViewsDay =
    getExtremeDay(
      days,
      (day) => day.views,
      "highest"
    );

  const lowestViewsDay =
    getExtremeDay(
      days,
      (day) => day.views,
      "lowest"
    );

  const highestRevenueDay =
    getExtremeDay(
      days,
      (day) => day.revenue,
      "highest"
    );

  const firstDay =
    days[0];

  const lastDay =
    days[
      days.length - 1
    ];

  return {
    totalDays:
      days.length,

    dateRange: {
      start:
        simulation.reporting
          ?.startDate,

      end:
        simulation.reporting
          ?.endDate,
    },

    milestones,

    activity: {
      scheduledUploads:
        uploadDays.length,

      publishedUploads:
        publishedUploadDays.length,

      missedUploads:
        missedUploadDays.length,

      scheduledStreams:
        streamDays.length,

      viralVideos:
        countEvents(
          days,
          "viral_video"
        ),

      sponsorships:
        countEvents(
          days,
          "sponsorship"
        ),

      merchandiseEvents:
        countEvents(
          days,
          "merchandise_launch"
        ),
    },

    averages: {
      allDays: {
        views:
          Math.round(
            averageMetric(
              days,
              (day) =>
                day.views
            )
          ),

        youtubeRevenue:
          Math.round(
            averageMetric(
              days,
              (day) =>
                day.revenueBreakdown
                  ?.youtube
            )
          ),
      },

      ordinaryDays: {
        views:
          Math.round(
            averageMetric(
              ordinaryDays,
              (day) =>
                day.views
            )
          ),
      },

      scheduledUploadDays: {
        views:
          Math.round(
            averageMetric(
              uploadDays,
              (day) =>
                day.views
            )
          ),
      },

      scheduledStreamDays: {
        views:
          Math.round(
            averageMetric(
              streamDays,
              (day) =>
                day.views
            )
          ),
      },
    },

    extremes: {
      highestViews:
        buildDayDiagnostic(
          highestViewsDay
        ),

      lowestViews:
        buildDayDiagnostic(
          lowestViewsDay
        ),

      highestRevenue:
        buildDayDiagnostic(
          highestRevenueDay
        ),
    },

    baselineChange: {
      start: {
        views:
          roundValue(
            firstDay
              ?.nextState
              ?.baseline
              ?.dailyYouTubeViews,
            1
          ),

        youtubeRevenue:
          roundValue(
            firstDay
              ?.nextState
              ?.baseline
              ?.dailyYouTubeRevenue,
            1
          ),
      },

      end: {
        views:
          roundValue(
            lastDay
              ?.nextState
              ?.baseline
              ?.dailyYouTubeViews,
            1
          ),

        youtubeRevenue:
          roundValue(
            lastDay
              ?.nextState
              ?.baseline
              ?.dailyYouTubeRevenue,
            1
          ),
      },
    },

    maximumMomentum: {
      audience:
        roundValue(
          getMaximumMomentum(
            days,
            "audience"
          )
        ),

      content:
        roundValue(
          getMaximumMomentum(
            days,
            "content"
          )
        ),

      revenue:
        roundValue(
          getMaximumMomentum(
            days,
            "revenue"
          )
        ),

      creator:
        roundValue(
          getMaximumMomentum(
            days,
            "creator"
          )
        ),

      sponsorship:
        roundValue(
          getMaximumMomentum(
            days,
            "sponsorship"
          )
        ),

      commerce:
        roundValue(
          getMaximumMomentum(
            days,
            "commerce"
          )
        ),
    },

    reporting: {
      today:
        buildDayDiagnostic(
          simulation.today
        ),

      current28Days:
        simulation.currentPeriod,

      previous28Days:
        simulation.previousPeriod,

      changes:
        simulation.changes,
    },
  };
}