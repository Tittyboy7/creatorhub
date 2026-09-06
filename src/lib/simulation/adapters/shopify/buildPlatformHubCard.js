function formatCompactNumber(value) {
  return new Intl.NumberFormat(
    "en-US",
    {
      notation: "compact",
      maximumFractionDigits: 1,
    }
  ).format(value || 0);
}

function formatCurrency(value) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }
  ).format(value || 0);
}

function formatPercent(value) {
  return `${Number(
    value || 0
  ).toFixed(1)}%`;
}

function formatPercentChange(value) {
  const roundedValue =
    Math.round(value || 0);

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

function buildPeriodMetrics(
  days = []
) {
  if (!days.length) {
    return {
      sessions: 0,
      orders: 0,
      unitsSold: 0,
      grossSales: 0,
      conversionRate: 0,
      averageOrderValue: 0,
      unitsPerOrder: 0,
    };
  }

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

  const unitsSold =
    sumMetric(
      days,
      (day) =>
        day.shopify?.unitsSold
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
    unitsSold,
    grossSales,

    conversionRate:
      sessions > 0
        ? (orders / sessions) * 100
        : 0,

    averageOrderValue:
      orders > 0
        ? grossSales / orders
        : 0,

    unitsPerOrder:
      orders > 0
        ? unitsSold / orders
        : 0,
  };
}

export default function buildShopifyPlatformHubCard({
  dailySimulation,
} = {}) {
  const days =
    dailySimulation?.days || [];

  if (!days.length) {
    return null;
  }

  const currentPeriodDays =
    dailySimulation?.reporting
      ?.currentPeriodDays || 28;

  const currentDays =
    days.slice(
      -currentPeriodDays
    );

  const previousDays =
    days.slice(
      -currentPeriodDays * 2,
      -currentPeriodDays
    );

  const currentPeriod =
    buildPeriodMetrics(
      currentDays
    );

  const previousPeriod =
    buildPeriodMetrics(
      previousDays
    );

  const today =
    days[days.length - 1] ||
    null;

  const shopifyToday =
    today?.shopify || null;

  const todayStats = [
    {
      metricKey: "orders",

      label: "Orders",

      value:
        formatCompactNumber(
          shopifyToday?.orders
        ),

      trend:
        formatPercentChange(
          calculatePercentChange(
            currentPeriod.orders,
            previousPeriod.orders
          )
        ),
    },

    {
      metricKey: "grossSales",

      label: "Sales",

      value:
        formatCurrency(
          shopifyToday
            ?.grossSales
        ),

      trend:
        formatPercentChange(
          calculatePercentChange(
            currentPeriod.grossSales,
            previousPeriod.grossSales
          )
        ),
    },

    {
      metricKey: "unitsSold",

      label: "Products Sold",

      value:
        formatCompactNumber(
          shopifyToday
            ?.unitsSold
        ),

      trend:
        formatPercentChange(
          calculatePercentChange(
            currentPeriod.unitsSold,
            previousPeriod.unitsSold
          )
        ),
    },

    {
      metricKey:
        "conversionRate",

      label: "Conversion",

      value:
        formatPercent(
          shopifyToday
            ?.conversionRate
        ),

      trend:
        formatPercentChange(
          calculatePercentChange(
            currentPeriod
              .conversionRate,
            previousPeriod
              .conversionRate
          )
        ),
    },

    {
      metricKey:
        "averageOrderValue",

      label:
        "Average Order Value",

      value:
        formatCurrency(
          shopifyToday
            ?.averageOrderValue
        ),

      trend:
        formatPercentChange(
          calculatePercentChange(
            currentPeriod
              .averageOrderValue,
            previousPeriod
              .averageOrderValue
          )
        ),
    },

    {
      metricKey:
        "sessions",

      label:
        "Sessions",

      value:
        formatCompactNumber(
          shopifyToday
            ?.sessions
        ),

      trend:
        formatPercentChange(
          calculatePercentChange(
            currentPeriod.sessions,
            previousPeriod.sessions
          )
        ),
    },

    {
      metricKey:
        "unitsPerOrder",

      label:
        "Units per Order",

      value:
        Number(
          shopifyToday
            ?.unitsPerOrder || 0
        ).toFixed(2),

      trend:
        formatPercentChange(
          calculatePercentChange(
            currentPeriod
              .unitsPerOrder,
            previousPeriod
              .unitsPerOrder
          )
        ),
    },
  ];

  const trendHistory =
    days.map((day) => ({
      date: day.date,

      metrics: {
        orders:
          day.shopify?.orders || 0,

        grossSales:
          day.shopify?.grossSales ||
          0,

        unitsSold:
          day.shopify?.unitsSold ||
          0,

        conversionRate:
          day.shopify
            ?.conversionRate || 0,

        averageOrderValue:
          day.shopify
            ?.averageOrderValue || 0,

        sessions:
          day.shopify?.sessions ||
          0,

        unitsPerOrder:
          day.shopify
            ?.unitsPerOrder || 0,
      },

      events:
        day.events?.map(
          (event) => ({
            type: event.type,
            label: event.label,
          })
        ) || [],
    }));

  return {
    summaryRevenue: 0,

    todayStats,

    trendHistory,

    summaryLabel:
      "Last 28 Days",

    overallStats: [
      {
        label: "Orders",
        value:
          formatCompactNumber(
            currentPeriod.orders
          ),
      },

      {
        label: "Gross Sales",
        value:
          formatCurrency(
            currentPeriod
              .grossSales
          ),
      },

      {
        label: "Conversion",
        value:
          formatPercent(
            currentPeriod
              .conversionRate
          ),
      },

      {
        label: "AOV",
        value:
          formatCurrency(
            currentPeriod
              .averageOrderValue
          ),
      },
    ],
  };
}