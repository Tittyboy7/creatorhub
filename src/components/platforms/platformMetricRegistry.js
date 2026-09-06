const PLATFORM_METRIC_REGISTRY = {
  youtube: {
    views: {
      key: "views",
      displayLabel: "Views",
      labels: ["views"],

      category: "audience",
      historyMode: "calendar",

      selectable: true,
      defaultSelected: true,
      defaultOrder: 1,

      requiresHistory: true,

      trendLabel: "Views trend",
      valueLabel: "views",
      format: "compact",

      trendEvents: [
        "viral_video",
        "missed_upload",
      ],
    },

    subscribers: {
      key: "subscribers",
      displayLabel: "Subscribers",

      labels: [
        "subscriber",
        "subscribers",
      ],

      category: "audience",
      historyMode: "calendar",

      selectable: true,
      defaultSelected: true,
      defaultOrder: 2,

      requiresHistory: true,

      trendLabel:
        "Net subscriber trend",

      valueLabel: "subscribers",
      format: "signedCompact",

      trendEvents: [
        "viral_video",
        "missed_upload",
      ],
    },

    revenue: {
      key: "revenue",
      displayLabel: "Revenue",
      labels: ["revenue"],

      category: "revenue",
      historyMode: "calendar",

      selectable: true,
      defaultSelected: true,
      defaultOrder: 3,

      requiresHistory: true,

      trendLabel:
        "YouTube revenue trend",

      valueLabel: "",
      format: "currency",

      trendEvents: [
        "merchandise_launch",
        "viral_video",
      ],
    },

    watchTime: {
      key: "watchTime",
      displayLabel: "Watch Time",

      labels: [
        "watch time",
        "watch",
      ],

      category: "engagement",
      historyMode: "calendar",

      selectable: true,
      defaultSelected: true,
      defaultOrder: 4,

      requiresHistory: true,

      trendLabel:
        "Watch time trend",

      valueLabel: "",
      format: "hours",

      trendEvents: [
        "viral_video",
        "missed_upload",
      ],
    },
  },

  twitch: {
    averageViewers: {
      key: "averageViewers",
      displayLabel: "Average Viewers",

      labels: [
        "average viewers",
        "avg viewers",
        "average concurrent viewers",
      ],

      category: "audience",
      historyMode: "activity-only",

      selectable: true,
      defaultSelected: true,
      defaultOrder: 1,

      requiresHistory: true,

      trendLabel:
        "Average viewer trend",

      valueLabel: "viewers",
      format: "compact",

      trendEvents: [],
    },

    followers: {
      key: "followers",
      displayLabel: "Followers",

      labels: [
        "followers",
        "follower",
      ],

      category: "audience",
      historyMode: "activity-only",

      selectable: true,
      defaultSelected: true,
      defaultOrder: 2,

      requiresHistory: true,

      trendLabel:
        "Follower growth trend",

      valueLabel: "followers",
      format: "signedCompact",

      trendEvents: [],
    },

    subscriptions: {
      key: "subscriptions",
      displayLabel: "Subs",

      labels: [
        "subs",
        "subscriptions",
        "subscription",
      ],

      category: "revenue",
      historyMode: "activity-only",

      selectable: true,
      defaultSelected: true,
      defaultOrder: 3,

      requiresHistory: true,

      trendLabel:
        "Subscription trend",

      valueLabel: "subs",
      format: "compact",

      trendEvents: [],
    },

    revenue: {
      key: "revenue",
      displayLabel: "Revenue",

      labels: ["revenue"],

      category: "revenue",
      historyMode: "activity-only",

      selectable: true,
      defaultSelected: true,
      defaultOrder: 4,

      requiresHistory: true,

      trendLabel:
        "Twitch revenue trend",

      valueLabel: "",
      format: "currency",

      trendEvents: [],
    },

    peakViewers: {
      key: "peakViewers",
      displayLabel: "Peak Viewers",

      labels: [
        "peak viewers",
        "peak concurrent viewers",
      ],

      category: "audience",
      historyMode: "activity-only",

      selectable: true,
      defaultSelected: false,
      defaultOrder: 5,

      requiresHistory: true,

      trendLabel:
        "Peak viewer trend",

      valueLabel: "viewers",
      format: "compact",

      trendEvents: [],
    },

    uniqueViewers: {
      key: "uniqueViewers",
      displayLabel: "Unique Viewers",

      labels: [
        "unique viewers",
      ],

      category: "audience",
      historyMode: "activity-only",

      selectable: true,
      defaultSelected: false,
      defaultOrder: 6,

      requiresHistory: true,

      trendLabel:
        "Unique viewer trend",

      valueLabel: "viewers",
      format: "compact",

      trendEvents: [],
    },

    hoursStreamed: {
      key: "hoursStreamed",
      displayLabel: "Hours Streamed",

      labels: [
        "hours streamed",
        "stream hours",
      ],

      category: "activity",
      historyMode: "activity-only",

      selectable: true,
      defaultSelected: false,
      defaultOrder: 7,

      requiresHistory: true,

      trendLabel:
        "Streaming hours trend",

      valueLabel: "",
      format: "hours",

      trendEvents: [],
    },
  },

  shopify: {
    orders: {
      key: "orders",
      displayLabel: "Orders",

      labels: [
        "orders",
        "order",
      ],

      category: "commerce",
      historyMode: "calendar",

      selectable: true,
      defaultSelected: true,
      defaultOrder: 1,

      requiresHistory: true,

      trendLabel:
        "Order trend",

      valueLabel: "orders",
      format: "compact",

      trendEvents: [
        "merchandise_launch",
      ],
    },

    grossSales: {
      key: "grossSales",
      displayLabel: "Sales",

      labels: [
        "sales",
        "gross sales",
        "revenue",
      ],

      category: "revenue",
      historyMode: "calendar",

      selectable: true,
      defaultSelected: true,
      defaultOrder: 2,

      requiresHistory: true,

      trendLabel:
        "Gross sales trend",

      valueLabel: "",
      format: "currency",

      trendEvents: [
        "merchandise_launch",
      ],
    },

    unitsSold: {
      key: "unitsSold",
      displayLabel:
        "Products Sold",

      labels: [
        "products sold",
        "units sold",
        "units",
      ],

      category: "commerce",
      historyMode: "calendar",

      selectable: true,
      defaultSelected: true,
      defaultOrder: 3,

      requiresHistory: true,

      trendLabel:
        "Units sold trend",

      valueLabel: "units",
      format: "compact",

      trendEvents: [
        "merchandise_launch",
      ],
    },

    conversionRate: {
      key: "conversionRate",
      displayLabel:
        "Conversion",

      labels: [
        "conversion",
        "conversion rate",
      ],

      category: "commerce",
      historyMode: "calendar",

      selectable: true,
      defaultSelected: true,
      defaultOrder: 4,

      requiresHistory: true,

      trendLabel:
        "Conversion rate trend",

      valueLabel: "",
      format: "percent",

      trendEvents: [
        "merchandise_launch",
      ],
    },

    averageOrderValue: {
      key: "averageOrderValue",
      displayLabel:
        "Average Order Value",

      labels: [
        "average order value",
        "aov",
      ],

      category: "commerce",
      historyMode: "calendar",

      selectable: true,
      defaultSelected: false,
      defaultOrder: 5,

      requiresHistory: true,

      trendLabel:
        "Average order value trend",

      valueLabel: "",
      format: "currency",

      trendEvents: [
        "merchandise_launch",
      ],
    },

    sessions: {
      key: "sessions",
      displayLabel: "Sessions",

      labels: [
        "sessions",
        "store sessions",
      ],

      category: "audience",
      historyMode: "calendar",

      selectable: true,
      defaultSelected: false,
      defaultOrder: 6,

      requiresHistory: true,

      trendLabel:
        "Store session trend",

      valueLabel: "sessions",
      format: "compact",

      trendEvents: [
        "merchandise_launch",
      ],
    },

    unitsPerOrder: {
      key: "unitsPerOrder",
      displayLabel:
        "Units per Order",

      labels: [
        "units per order",
        "items per order",
      ],

      category: "commerce",
      historyMode: "calendar",

      selectable: true,
      defaultSelected: false,
      defaultOrder: 7,

      requiresHistory: true,

      trendLabel:
        "Units per order trend",

      valueLabel: "",
      format: "decimal",

      trendEvents: [
        "merchandise_launch",
      ],
    },
  },
};

function formatCompactNumber(value) {
  return new Intl.NumberFormat(
    "en-US",
    {
      notation: "compact",
      maximumFractionDigits: 1,
    }
  ).format(value);
}

export function getPlatformMetricDefinition(
  platformKey,
  metricKey
) {
  return (
    PLATFORM_METRIC_REGISTRY[
      platformKey
    ]?.[metricKey] || null
  );
}

export function getPlatformMetricCatalog(
  platformKey
) {
  const registry =
    PLATFORM_METRIC_REGISTRY[
      platformKey
    ];

  if (!registry) {
    return [];
  }

  return Object.values(
    registry
  );
}

export function getSelectablePlatformMetrics(
  platformKey
) {
  return getPlatformMetricCatalog(
    platformKey
  ).filter(
    (metric) =>
      metric.selectable !== false
  );
}

export function getDefaultPlatformMetricKeys(
  platformKey
) {
  return getSelectablePlatformMetrics(
    platformKey
  )
    .filter(
      (metric) =>
        metric.defaultSelected
    )
    .sort(
      (firstMetric, secondMetric) =>
        (firstMetric.defaultOrder || 0) -
        (secondMetric.defaultOrder || 0)
    )
    .map(
      (metric) =>
        metric.key
    )
    .slice(0, 4);
}

export function getAvailablePlatformMetrics({
  platformKey,
  availableMetricKeys = [],
}) {
  const availableKeys =
    new Set(
      availableMetricKeys
    );

  return getSelectablePlatformMetrics(
    platformKey
  ).filter((metric) => {
    if (!metric.requiresHistory) {
      return true;
    }

    return availableKeys.has(
      metric.key
    );
  });
}

export function resolvePlatformMetricKeys({
  platformKey,
  preferredMetricKeys = [],
  availableMetricKeys = [],
  limit = 4,
}) {
  const availableMetrics =
    getAvailablePlatformMetrics({
      platformKey,
      availableMetricKeys,
    });

  const availableKeys =
    new Set(
      availableMetrics.map(
        (metric) =>
          metric.key
      )
    );

  const defaultMetricKeys =
    getDefaultPlatformMetricKeys(
      platformKey
    );

  const resolvedKeys = [];

  function addMetricKey(metricKey) {
    if (
      !metricKey ||
      !availableKeys.has(metricKey) ||
      resolvedKeys.includes(metricKey) ||
      resolvedKeys.length >= limit
    ) {
      return;
    }

    resolvedKeys.push(
      metricKey
    );
  }

  preferredMetricKeys.forEach(
    addMetricKey
  );

  defaultMetricKeys.forEach(
    addMetricKey
  );

  availableMetrics.forEach(
    (metric) =>
      addMetricKey(
        metric.key
      )
  );

  return resolvedKeys.slice(
    0,
    limit
  );
}

export function getPlatformMetricKey(
  platformKey,
  label = ""
) {
  const registry =
    PLATFORM_METRIC_REGISTRY[
      platformKey
    ];

  if (!registry) {
    return null;
  }

  const normalizedLabel =
    label.toLowerCase();

  const metric =
    Object.values(
      registry
    ).find((definition) =>
      definition.labels.some(
        (candidate) =>
          normalizedLabel.includes(
            candidate
          )
      )
    );

  return metric?.key || null;
}

export function formatPlatformMetricValue(
  value,
  definition
) {
  const safeValue =
    Number(value) || 0;

  if (!definition) {
    return formatCompactNumber(
      safeValue
    );
  }

  if (
    definition.format === "currency"
  ) {
    return new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }
    ).format(safeValue);
  }

  if (
    definition.format ===
    "signedCompact"
  ) {
    const formatted =
      formatCompactNumber(
        Math.abs(safeValue)
      );

    if (safeValue > 0) {
      return `+${formatted}`;
    }

    if (safeValue < 0) {
      return `-${formatted}`;
    }

    return formatted;
  }

  if (
    definition.format === "hours"
  ) {
    return `${formatCompactNumber(
      safeValue
    )}h`;
  }

  if (
    definition.format === "percent"
  ) {
    return `${safeValue.toFixed(
      1
    )}%`;
  }

  if (
    definition.format === "decimal"
  ) {
    return safeValue.toFixed(
      2
    );
  }

  return formatCompactNumber(
    safeValue
  );
}

export function getPlatformMetricTrendEvent(
  events = [],
  definition
) {
  const priority =
    definition?.trendEvents || [];

  for (const type of priority) {
    const event =
      events.find(
        (item) =>
          item.type === type
      );

    if (event) {
      return event;
    }
  }

  return null;
}