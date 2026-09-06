import buildPlatformHealth from "@/lib/simulation/hub/buildPlatformHealth";

function buildDays({
  platformKey,
  previous,
  current,
}) {
  const days = [];

  function distribute(
    total,
    dayCount
  ) {
    return total / dayCount;
  }

  function buildDay(
    period,
    index
  ) {
    const date =
      `scenario-${period}-${index + 1}`;

    if (
      platformKey === "youtube"
    ) {
      return {
        date,

        views:
          distribute(
            period === "previous"
              ? previous.views
              : current.views,
            28
          ),

        watchTimeHours:
          distribute(
            period === "previous"
              ? previous.watchTime
              : current.watchTime,
            28
          ),

        netSubscriberGrowth:
          distribute(
            period === "previous"
              ? previous.subscribers
              : current.subscribers,
            28
          ),

        revenueBreakdown: {
          youtube:
            distribute(
              period === "previous"
                ? previous.revenue
                : current.revenue,
              28
            ),
        },
      };
    }

    if (
      platformKey === "twitch"
    ) {
      return {
        date,

        twitch: {
          streamedToday: true,

          averageConcurrentViewers:
            period === "previous"
              ? previous.averageViewers
              : current.averageViewers,

          followersGained:
            distribute(
              period === "previous"
                ? previous.followers
                : current.followers,
              28
            ),

          subscriptions:
            distribute(
              period === "previous"
                ? previous.subscriptions
                : current.subscriptions,
              28
            ),

          revenue:
            distribute(
              period === "previous"
                ? previous.revenue
                : current.revenue,
              28
            ),
        },
      };
    }

    return {
      date,

      shopify: {
        sessions:
          distribute(
            period === "previous"
              ? previous.sessions
              : current.sessions,
            28
          ),

        orders:
          distribute(
            period === "previous"
              ? previous.orders
              : current.orders,
            28
          ),

        grossSales:
          distribute(
            period === "previous"
              ? previous.grossSales
              : current.grossSales,
            28
          ),
      },
    };
  }

  for (
    let index = 0;
    index < 28;
    index += 1
  ) {
    days.push(
      buildDay(
        "previous",
        index
      )
    );
  }

  for (
    let index = 0;
    index < 28;
    index += 1
  ) {
    days.push(
      buildDay(
        "current",
        index
      )
    );
  }

  return days;
}

function runScenario({
  name,
  platformKey,
  expectedStatus,
  previous,
  current,
}) {
  const dailySimulation = {
    reporting: {
      currentPeriodDays: 28,
    },

    days:
      buildDays({
        platformKey,
        previous,
        current,
      }),
  };

  const result =
    buildPlatformHealth({
      platformKey,
      dailySimulation,
    });

  return {
    name,
    platformKey,
    expectedStatus,

    actualStatus:
      result.status,

    passed:
      result.status ===
      expectedStatus,

    attentionReason:
      result.attentionReason,

    signals:
      result.signals,
  };
}

export default function buildPlatformHealthScenarioDiagnostic() {
  const scenarios = [
    {
      name:
        "YouTube major multi-metric decline",

      platformKey:
        "youtube",

      expectedStatus:
        "attention",

      previous: {
        views: 100000,
        watchTime: 10000,
        subscribers: 1000,
        revenue: 3000,
      },

      current: {
        views: 78000,
        watchTime: 8200,
        subscribers: 860,
        revenue: 2760,
      },
    },

    {
      name:
        "YouTube normal softness",

      platformKey:
        "youtube",

      expectedStatus:
        "healthy",

      previous: {
        views: 100000,
        watchTime: 10000,
        subscribers: 1000,
        revenue: 3000,
      },

      current: {
        views: 95000,
        watchTime: 9600,
        subscribers: 970,
        revenue: 2910,
      },
    },

    {
      name:
        "Twitch audience weakness",

      platformKey:
        "twitch",

      expectedStatus:
        "attention",

      previous: {
        averageViewers: 800,
        followers: 1000,
        subscriptions: 1300,
        revenue: 1600,
      },

      current: {
        averageViewers: 672,
        followers: 870,
        subscriptions: 1240,
        revenue: 1520,
      },
    },

    {
      name:
        "Twitch ordinary softness",

      platformKey:
        "twitch",

      expectedStatus:
        "healthy",

      previous: {
        averageViewers: 800,
        followers: 1000,
        subscriptions: 1300,
        revenue: 1600,
      },

      current: {
        averageViewers: 824,
        followers: 980,
        subscriptions: 1220,
        revenue: 1490,
      },
    },

    {
      name:
        "Shopify commerce decline",

      platformKey:
        "shopify",

      expectedStatus:
        "attention",

      previous: {
        sessions: 5000,
        orders: 180,
        grossSales: 9000,
      },

      current: {
        sessions: 4700,
        orders: 150,
        grossSales: 7600,
      },
    },

    {
      name:
        "Shopify conversion weakness",

      platformKey:
        "shopify",

      expectedStatus:
        "attention",

      previous: {
        sessions: 5000,
        orders: 180,
        grossSales: 9000,
      },

      current: {
        sessions: 5200,
        orders: 150,
        grossSales: 7600,
      },
    },

    {
      name:
        "Shopify normal variation",

      platformKey:
        "shopify",

      expectedStatus:
        "healthy",

      previous: {
        sessions: 5000,
        orders: 180,
        grossSales: 9000,
      },

      current: {
        sessions: 4950,
        orders: 176,
        grossSales: 8900,
      },
    },
  ];

  const results =
    scenarios.map(
      runScenario
    );

  return {
    totalScenarios:
      results.length,

    passed:
      results.filter(
        (result) =>
          result.passed
      ).length,

    failed:
      results.filter(
        (result) =>
          !result.passed
      ).length,

    results,
  };
}