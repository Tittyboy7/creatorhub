function getTrendDirection(value, threshold = 3) {
  if (value >= threshold) {
    return "up";
  }

  if (value <= -threshold) {
    return "down";
  }

  return "stable";
}

function getMomentumLevel(changes) {
  const values = [
    changes?.views || 0,
    changes?.watchTimeHours || 0,
    changes?.netSubscriberGrowth || 0,
    changes?.revenue || 0,
  ];

  const averageChange =
    values.reduce(
      (total, value) => total + value,
      0
    ) / values.length;

  if (averageChange >= 15) {
    return "surging";
  }

  if (averageChange >= 5) {
    return "growing";
  }

  if (averageChange <= -15) {
    return "declining";
  }

  if (averageChange <= -5) {
    return "softening";
  }

  return "stable";
}

function flattenReportingPeriodEvents(
  history
) {
  const days =
    history?.days ||
    history?.dailyHistory ||
    [];

  if (days.length) {
    const startDate =
      history.currentPeriod
        ?.startDate;

    const endDate =
      history.currentPeriod
        ?.endDate;

    const reportingDays =
      startDate && endDate
        ? days.filter(
            (day) =>
              day.date >= startDate &&
              day.date <= endDate
          )
        : days.slice(-28);

    return reportingDays.flatMap(
      (day) =>
        (day.events || []).map(
          (event) => ({
            ...event,

            dayIndex:
              day.dayIndex,

            date:
              day.date,

            weekIndex:
              day.weekIndex,
          })
        )
    );
  }

  const weeks =
    history?.weeks || [];

  const startWeek =
    history?.currentPeriod
      ?.startWeek;

  const endWeek =
    history?.currentPeriod
      ?.endWeek;

  const reportingWeeks =
    startWeek && endWeek
      ? weeks.filter(
          (week) =>
            week.weekIndex >=
              startWeek &&
            week.weekIndex <=
              endWeek
        )
      : weeks;

  return reportingWeeks.flatMap(
    (week) =>
      (week.events || []).map(
        (event) => ({
          ...event,
          weekIndex:
            week.weekIndex,
        })
      )
  );
}

function countEvents(events, type) {
  return events.filter(
    (event) => event.type === type
  ).length;
}

function getMostRecentEvent(events, type) {
  return [...events]
    .reverse()
    .find((event) => event.type === type);
}

function buildPrimaryDriver({
  events,
  changes,
}) {
  const viralEvent = getMostRecentEvent(
    events,
    "viral_video"
  );

  if (
    viralEvent &&
    (changes?.views || 0) > 0
  ) {
    return {
      type: "viral_video",
      label: "Viral content momentum",
      explanation:
        "A viral upload is the strongest recent driver of audience growth and content discovery.",
      weekIndex: viralEvent.weekIndex,
    };
  }

  const sponsorshipEvent = getMostRecentEvent(
    events,
    "sponsorship"
  );

  if (
    sponsorshipEvent &&
    (changes?.revenue || 0) > 0
  ) {
    return {
      type: "sponsorship",
      label: "Sponsorship revenue",
      explanation:
        "A recent sponsorship is the strongest contributor to revenue growth.",
      weekIndex: sponsorshipEvent.weekIndex,
    };
  }

  if ((changes?.views || 0) > 5) {
    return {
      type: "content_growth",
      label: "Content performance",
      explanation:
        "Recent publishing activity is producing stronger audience reach than the previous reporting period.",
      weekIndex: null,
    };
  }

  if ((changes?.revenue || 0) < -5) {
    return {
      type: "revenue_decline",
      label: "Revenue softness",
      explanation:
        "Revenue is declining faster than the broader audience metrics.",
      weekIndex: null,
    };
  }

  return {
    type: "stable_performance",
    label: "Stable business performance",
    explanation:
      "No single event is dominating performance during the current reporting period.",
    weekIndex: null,
  };
}

function buildRisks({
  changes,
  events,
}) {
  const risks = [];

  if ((changes?.revenue || 0) <= -10) {
    risks.push({
      type: "revenue_decline",
      severity: "high",
      label: "Revenue is declining",
      explanation:
        "Revenue fell by more than 10% compared with the previous reporting period.",
    });
  }

  if (
    (changes?.netSubscriberGrowth || 0) <= -10
  ) {
    risks.push({
      type: "subscriber_slowdown",
      severity: "medium",
      label: "Subscriber growth is slowing",
      explanation:
        "Net subscriber growth is materially lower than the previous reporting period.",
    });
  }

  const missedUploadCount = countEvents(
    events,
    "missed_upload"
  );

  if (missedUploadCount >= 2) {
    risks.push({
      type: "publishing_consistency",
      severity: "medium",
      label: "Publishing consistency weakened",
      explanation: `${missedUploadCount} missed-upload events occurred during the simulated history.`,
    });
  }

  if (!risks.length) {
    risks.push({
      type: "low_risk",
      severity: "low",
      label: "No major immediate risk",
      explanation:
        "The current business signals do not indicate a critical performance issue.",
    });
  }

  return risks;
}

function buildOpportunities({
  changes,
  events,
}) {
  const opportunities = [];

  if ((changes?.views || 0) >= 10) {
    opportunities.push({
      type: "content_follow_up",
      priority: "high",
      label: "Follow up on content momentum",
      explanation:
        "Audience reach is growing quickly enough to justify a related follow-up upload.",
    });
  }

  if (
    countEvents(events, "viral_video") > 0
  ) {
    opportunities.push({
      type: "convert_viral_audience",
      priority: "high",
      label: "Convert viral viewers",
      explanation:
        "Use the recent viral attention to promote subscriptions, memberships, and merchandise.",
    });
  }

  if (
    (changes?.views || 0) > 5 &&
    (changes?.revenue || 0) < 5
  ) {
    opportunities.push({
      type: "monetization_gap",
      priority: "medium",
      label: "Close the monetization gap",
      explanation:
        "Audience growth is outpacing revenue growth, which suggests the increased attention is not being fully monetized.",
    });
  }

  if (
    countEvents(events, "sponsorship") === 0
  ) {
    opportunities.push({
      type: "sponsorship_growth",
      priority: "medium",
      label: "Pursue sponsorship revenue",
      explanation:
        "No sponsorship event was generated during the current history despite meaningful audience activity.",
    });
  }

  return opportunities;
}

export default function buildBusinessIntelligence({
  creator,
  history,
}) {
  if (
    !creator ||
    !history?.currentPeriod ||
    !history?.changes
  ) {
    return null;
  }

  const events =
    flattenReportingPeriodEvents(
      history
    );

  const weeks =
    history.weeks || [];

  const days =
    history.days ||
    history.dailyHistory ||
    [];

  const recentWeek =
    weeks[
      weeks.length - 1
    ] || null;

  const recentDay =
    days[
      days.length - 1
    ] || null;
  const changes = history.changes;

  return {
    creator: {
      id: creator.id,
      name: creator.profile?.name,
      username: creator.profile?.username,
      niche: creator.profile?.niche,
      creatorType:
        creator.profile?.creatorType,
      primaryPlatform:
        creator.business?.primaryPlatform,
      goals: creator.business?.goals || [],
    },

    reportingPeriod: {
      current: {
        startDate:
          history.currentPeriod
            .startDate || null,

        endDate:
          history.currentPeriod
            .endDate || null,

        startWeek:
          history.currentPeriod
            .startWeek ?? null,

        endWeek:
          history.currentPeriod
            .endWeek ?? null,
      },

      previous:
        history.previousPeriod
          ? {
              startDate:
                history.previousPeriod
                  .startDate || null,

              endDate:
                history.previousPeriod
                  .endDate || null,

              startWeek:
                history.previousPeriod
                  .startWeek ?? null,

              endWeek:
                history.previousPeriod
                  .endWeek ?? null,
            }
          : null,
    },

    performance: {
      momentum: getMomentumLevel(changes),

      views: {
        value: history.currentPeriod.views,
        change: changes.views,
        direction: getTrendDirection(
          changes.views
        ),
      },

      watchTime: {
        value:
          history.currentPeriod
            .watchTimeHours,
        change: changes.watchTimeHours,
        direction: getTrendDirection(
          changes.watchTimeHours
        ),
      },

      subscriberGrowth: {
        value:
          history.currentPeriod
            .netSubscriberGrowth,
        change:
          changes.netSubscriberGrowth,
        direction: getTrendDirection(
          changes.netSubscriberGrowth
        ),
      },

      revenue: {
        value:
          history.currentPeriod.revenue,
        change: changes.revenue,
        direction: getTrendDirection(
          changes.revenue
        ),
      },
    },

    activity: {
      totalEvents: events.length,

      contentPublishedCount:
        countEvents(
          events,
          "content_published"
        ),

      viralVideoCount:
        countEvents(events, "viral_video"),

      sponsorshipCount:
        countEvents(events, "sponsorship"),

      missedUploadCount:
        countEvents(events, "missed_upload"),

      merchandiseLaunchCount:
        countEvents(
          events,
          "merchandise_launch"
        ),

      mostRecentDay: recentDay
        ? {
            dayIndex:
              recentDay.dayIndex,

            date:
              recentDay.date,

            events:
              recentDay.events || [],
          }
        : null,

      mostRecentWeek: recentWeek
        ? {
            weekIndex:
              recentWeek.weekIndex,
            events:
              recentWeek.events || [],
          }
        : null,
    },

    primaryDriver: buildPrimaryDriver({
      events,
      changes,
    }),

    risks: buildRisks({
      changes,
      events,
    }),

    opportunities: buildOpportunities({
      changes,
      events,
    }),

    evidence: {
      currentPeriod:
        history.currentPeriod,

      previousPeriod:
        history.previousPeriod,

      changes,

      events,
    },
  };
}