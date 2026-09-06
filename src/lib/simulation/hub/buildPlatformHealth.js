function calculatePercentChange(
  currentValue,
  previousValue
) {
  if (
    !Number.isFinite(currentValue) ||
    !Number.isFinite(previousValue) ||
    previousValue === 0
  ) {
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
      total +
      (getter(day) || 0),
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

  return (
    sumMetric(
      days,
      getter
    ) / days.length
  );
}

function getReportingPeriods(
  dailySimulation,
  endIndex = null
) {
  const days =
    dailySimulation?.days || [];

  const periodDays =
    dailySimulation?.reporting
      ?.currentPeriodDays || 28;

  const resolvedEndIndex =
    Number.isInteger(endIndex)
      ? Math.min(
          Math.max(
            endIndex,
            0
          ),
          days.length - 1
        )
      : days.length - 1;

  const historyThroughEnd =
    days.slice(
      0,
      resolvedEndIndex + 1
    );

  if (
    historyThroughEnd.length <
    periodDays * 2
  ) {
    return null;
  }

  return {
    currentDays:
      historyThroughEnd.slice(
        -periodDays
      ),

    previousDays:
      historyThroughEnd.slice(
        -periodDays * 2,
        -periodDays
      ),
  };
}

function buildYouTubeHealth({
  currentDays,
  previousDays,
}) {
  const current = {
    views:
      sumMetric(
        currentDays,
        (day) =>
          day.views
      ),

    watchTime:
      sumMetric(
        currentDays,
        (day) =>
          day.watchTimeHours
      ),

    subscribers:
      sumMetric(
        currentDays,
        (day) =>
          day.netSubscriberGrowth
      ),

    revenue:
      sumMetric(
        currentDays,
        (day) =>
          day.revenueBreakdown
            ?.youtube ??
          day.revenue ??
          0
      ),
  };

  const previous = {
    views:
      sumMetric(
        previousDays,
        (day) =>
          day.views
      ),

    watchTime:
      sumMetric(
        previousDays,
        (day) =>
          day.watchTimeHours
      ),

    subscribers:
      sumMetric(
        previousDays,
        (day) =>
          day.netSubscriberGrowth
      ),

    revenue:
      sumMetric(
        previousDays,
        (day) =>
          day.revenueBreakdown
            ?.youtube ??
          day.revenue ??
          0
      ),
  };

  const changes = {
    views:
      calculatePercentChange(
        current.views,
        previous.views
      ),

    watchTime:
      calculatePercentChange(
        current.watchTime,
        previous.watchTime
      ),

    subscribers:
      calculatePercentChange(
        current.subscribers,
        previous.subscribers
      ),

    revenue:
      calculatePercentChange(
        current.revenue,
        previous.revenue
      ),
  };

  const majorDeclines =
    Object.entries(changes)
      .filter(
        ([, change]) =>
          change <= -10
      )
      .map(
        ([metric]) => metric
      );

  if (majorDeclines.length >= 2) {
    return {
      status: "attention",

      attentionReason:
        "Multiple core YouTube metrics are down more than 10% versus the previous 28 days.",

      signals: changes,
    };
  }

  if (
    changes.views <= -15 &&
    changes.watchTime <= -10
  ) {
    return {
      status: "attention",

      attentionReason:
        "YouTube reach and watch time have both declined materially versus the previous 28 days.",

      signals: changes,
    };
  }

  return {
    status: "healthy",
    attentionReason: null,
    signals: changes,
  };
}

function buildTwitchHealth({
  currentDays,
  previousDays,
}) {
  const currentStreams =
    currentDays.filter(
      (day) =>
        day.twitch?.streamedToday
    );

  const previousStreams =
    previousDays.filter(
      (day) =>
        day.twitch?.streamedToday
    );

  if (
    !currentStreams.length ||
    !previousStreams.length
  ) {
    return {
      status: "unknown",
      attentionReason: null,
      signals: null,
    };
  }

  const current = {
    averageViewers:
      averageMetric(
        currentStreams,
        (day) =>
          day.twitch
            ?.averageConcurrentViewers
      ),

    followers:
      sumMetric(
        currentStreams,
        (day) =>
          day.twitch
            ?.followersGained
      ),

    subscriptions:
      sumMetric(
        currentStreams,
        (day) =>
          day.twitch
            ?.subscriptions
      ),

    revenue:
      sumMetric(
        currentStreams,
        (day) =>
          day.twitch?.revenue
      ),
  };

  const previous = {
    averageViewers:
      averageMetric(
        previousStreams,
        (day) =>
          day.twitch
            ?.averageConcurrentViewers
      ),

    followers:
      sumMetric(
        previousStreams,
        (day) =>
          day.twitch
            ?.followersGained
      ),

    subscriptions:
      sumMetric(
        previousStreams,
        (day) =>
          day.twitch
            ?.subscriptions
      ),

    revenue:
      sumMetric(
        previousStreams,
        (day) =>
          day.twitch?.revenue
      ),
  };

  const changes = {
    averageViewers:
      calculatePercentChange(
        current.averageViewers,
        previous.averageViewers
      ),

    followers:
      calculatePercentChange(
        current.followers,
        previous.followers
      ),

    subscriptions:
      calculatePercentChange(
        current.subscriptions,
        previous.subscriptions
      ),

    revenue:
      calculatePercentChange(
        current.revenue,
        previous.revenue
      ),
  };

  const audienceWeakness =
    changes.averageViewers <= -10 &&
    changes.followers <= -10;

  const monetizationWeakness =
    changes.subscriptions <= -10 &&
    changes.revenue <= -10;

  if (
    audienceWeakness ||
    monetizationWeakness
  ) {
    return {
      status: "attention",

      attentionReason:
        audienceWeakness
          ? "Twitch viewership and follower growth are both materially below the previous 28 days."
          : "Twitch subscriptions and revenue are both materially below the previous 28 days.",

      signals: changes,
    };
  }

  return {
    status: "healthy",
    attentionReason: null,
    signals: changes,
  };
}

function buildShopifyHealth({
  currentDays,
  previousDays,
}) {
  function buildCommercePeriod(
    days
  ) {
    const sessions =
      sumMetric(
        days,
        (day) =>
          day.shopify?.sessions
      );

    const orders =
      sumMetric(
        days,
        (day) =>
          day.shopify?.orders
      );

    const grossSales =
      sumMetric(
        days,
        (day) =>
          day.shopify?.grossSales
      );

    return {
      sessions,
      orders,
      grossSales,

      conversionRate:
        sessions > 0
          ? (orders / sessions) * 100
          : 0,
    };
  }

  const current =
    buildCommercePeriod(
      currentDays
    );

  const previous =
    buildCommercePeriod(
      previousDays
    );

  const changes = {
    sessions:
      calculatePercentChange(
        current.sessions,
        previous.sessions
      ),

    orders:
      calculatePercentChange(
        current.orders,
        previous.orders
      ),

    grossSales:
      calculatePercentChange(
        current.grossSales,
        previous.grossSales
      ),

    conversionRate:
      calculatePercentChange(
        current.conversionRate,
        previous.conversionRate
      ),
  };

  if (
    changes.sessions >= 0 &&
    changes.conversionRate <= -10
  ) {
    return {
      status: "attention",

      attentionReason:
        "Store traffic is holding up, but Shopify conversion has fallen materially versus the previous 28 days.",

      signals: changes,
    };
  }

  if (
    changes.orders <= -10 &&
    changes.grossSales <= -10
  ) {
    return {
      status: "attention",

      attentionReason:
        "Shopify orders and gross sales are both materially below the previous 28 days.",

      signals: changes,
    };
  }

  return {
    status: "healthy",
    attentionReason: null,
    signals: changes,
  };
}

export default function buildPlatformHealth({
  platformKey,
  dailySimulation,
  endIndex = null,
} = {}) {
  if (
    !platformKey ||
    !dailySimulation
  ) {
    return {
      status: "unknown",
      attentionReason: null,
      signals: null,
    };
  }

  const periods =
    getReportingPeriods(
      dailySimulation,
      endIndex
    );

  if (!periods) {
    return {
      status: "unknown",
      attentionReason: null,
      signals: null,
    };
  }

  if (platformKey === "youtube") {
    return buildYouTubeHealth(
      periods
    );
  }

  if (platformKey === "twitch") {
    return buildTwitchHealth(
      periods
    );
  }

  if (platformKey === "shopify") {
    return buildShopifyHealth(
      periods
    );
  }

  return {
    status: "unknown",
    attentionReason: null,
    signals: null,
  };
}