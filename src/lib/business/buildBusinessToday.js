function getConfidenceLabel({ score }) {
  if (score >= 80) return "High confidence";
  if (score >= 60) return "Good confidence";
  if (score >= 40) return "Limited confidence";

  return "Low confidence";
}

function buildConfidence({
  businessSummary,
} = {}) {
  const integrations = businessSummary?.integrations || {};
  const dataQuality = businessSummary?.dataQuality || {};
  const revenue = businessSummary?.revenue || {};

  const connectedAccounts = Number(
    integrations.connectedAccounts || 0
  );

  const healthyConnections = Number(
    integrations.healthyConnections || 0
  );

  const connectionsNeedingAttention = Number(
    integrations.connectionsNeedingAttention || 0
  );

  const integrationHealthScore =
    connectedAccounts === 0
      ? 35
      : Math.round(
          (healthyConnections / connectedAccounts) * 100
        );

  const revenueHealthScore =
    Number(revenue.total || 0) > 0 ? 100 : 35;

  const dataConfidenceScore = {
    high: 100,
    medium: 70,
    low: 40,
  }[dataQuality.confidence] || 40;

  const baseScore = Math.min(
    100,
    Math.round(
      integrationHealthScore * 0.4 +
        revenueHealthScore * 0.35 +
        dataConfidenceScore * 0.25
    )
  );

  const connectionPenalty =
    connectionsNeedingAttention > 0
      ? Math.min(
          30,
          connectionsNeedingAttention * 10
        )
      : 0;

  const score = Math.max(
    0,
    baseScore - connectionPenalty
  );

  const availableDomains = Array.isArray(
    dataQuality.availableDomains
  )
    ? dataQuality.availableDomains
    : [];

  const missingDomains = Array.isArray(
    dataQuality.missingDomains
  )
    ? dataQuality.missingDomains
    : [];

  const totalDomains =
    availableDomains.length + missingDomains.length;

  return {
    score,

    label: getConfidenceLabel({
      score,
    }),

    dataConfidence:
      dataQuality.confidence === "high"
        ? "High"
        : dataQuality.confidence === "medium"
          ? "Medium"
          : "Limited",

    healthyConnections,
    connectedAccounts,

    businessCoverage:
      totalDomains > 0
        ? `${availableDomains.length}/${totalDomains}`
        : "Limited",
  };
}

function buildPriority({
  businessSignals = [],
  businessCauses = [],
  connectedAccounts = 0,
} = {}) {
  const signal = businessSignals[0] || null;

  const cause =
    businessCauses.find(
      (item) =>
        item.signalId === signal?.id &&
        item.metadata?.primary
    ) ||
    businessCauses.find(
      (item) => item.signalId === signal?.id
    ) ||
    null;

  if (!signal) {
    if (connectedAccounts > 0) {
      return {
        id: "no-urgent-action",
        eyebrow: "Today’s Priority",
        title: "No urgent business action detected",
        explanation:
          "CreatorsHub has not identified a high-priority risk or opportunity from the currently available data. Keep your platforms synchronized and review the supporting snapshot for smaller changes.",
        impact: "Business monitoring",
        action: {
          label: "Review Revenue Intelligence",
          href: "/revenue",
        },
        severity: "low",
      };
    }

  return {
    id: "business-foundation",
    eyebrow: "Today’s Priority",
    title: "Build a stronger business data foundation",
    explanation:
      "Connect platforms and track revenue consistently so CreatorsHub can identify stronger risks and opportunities.",
    impact: "Recommendation quality",
    action: {
      label: "Connect a Platform",
      href: "/connected-accounts",
    },
    severity: "low",
  };
}

  return {
      id: signal.id,

      eyebrow: "Today’s Priority",

      title:
        signal.id === "integration-health-warning" &&
        signal.metadata?.affectedPlatforms?.length === 1
          ? `Reconnect ${signal.metadata.affectedPlatforms[0]}`
          : signal.title,

      explanation:
        cause?.explanation ||
        signal.reason ||
        signal.recommendation,

      impact:
        signal.metadata?.affectedBusinessAreas?.length > 0
          ? `${signal.metadata.affectedBusinessAreas.join(
              ", "
            )} intelligence`
          : signal.category,

      action:
        signal.id === "integration-health-warning" &&
        signal.metadata?.affectedPlatforms?.length === 1
          ? {
              label: `Reconnect ${signal.metadata.affectedPlatforms[0]}`,
              href: `/connected-accounts/${String(
                signal.metadata.affectedPlatforms[0]
              ).toLowerCase()}`,
            }
          : signal.action || {
              label: "Review Business Intelligence",
              href: "/dashboard",
            },

      severity: signal.severity || "low",
    };
  }

function buildEvidence({
  businessSummary,
  businessSignals = [],
  prioritySignalId,
  hasCurrentMonthRevenueData = false,
  revenueThisMonth = 0,
  totalFollowers = 0,
  productsCount = 0,
} = {}) {
  const evidence = [];

  const revenue = businessSummary?.revenue || {};
  const audience = businessSummary?.audience || {};
  const commerce = businessSummary?.commerce || {};
  const integrations = businessSummary?.integrations || {};

  const monthlyGrowthPercent = Number(
    revenue.monthlyGrowthPercent || 0
  );

  if (monthlyGrowthPercent > 0) {
    evidence.push({
      id: "revenue-growth",
      title: `Revenue increased ${monthlyGrowthPercent}%`,
      detail:
        "Tracked revenue increased compared with the previous tracked month.",
      importance: "medium",
    });
  } else if (monthlyGrowthPercent < 0) {
    evidence.push({
      id: "revenue-decline",
      title: `Revenue decreased ${Math.abs(
        monthlyGrowthPercent
      )}%`,
      detail:
        "Tracked revenue declined compared with the previous tracked month.",
      importance: "high",
    });
  } else if (hasCurrentMonthRevenueData) {
    evidence.push({
      id: "revenue-current-month",
      title: `${formatCurrency(
        revenueThisMonth
      )} recorded this month`,
      detail:
        "No significant month-over-month movement has been confirmed yet.",
      importance: "low",
    });
  } else {
    evidence.push({
      id: "revenue-missing-current-month",
      title: "No revenue recorded this month",
      detail:
        "A current-month entry is needed before CreatorsHub can calculate a month-over-month change.",
      importance: "low",
    });
  }

  businessSignals
    .filter((signal) => signal.id !== prioritySignalId)
    .filter(
      (signal) =>
        signal.id !== "revenue-growth-positive" &&
        signal.id !== "revenue-growth-negative"
    )
    .slice(0, 1)
    .forEach((signal) => {
      evidence.push({
        id: signal.id,
        title: signal.title,
        detail: signal.reason || signal.recommendation,
        importance:
          signal.severity === "high"
            ? "high"
            : signal.severity === "medium"
              ? "medium"
              : "low",
      });
    });

  if (evidence.length < 3) {
    const platformSubscribers = Number(
      audience.subscribers || 0
    );

    const platformFollowers = Number(
      audience.followers || 0
    );

    const marketplaceFollowers = Number(
      totalFollowers || 0
    );

    let audienceText = "Audience data is currently limited.";
    let hasAudienceData = false;

    if (platformSubscribers > 0) {
      audienceText = `${formatNumber(
        platformSubscribers
      )} connected-platform subscribers are currently available for analysis.`;

      hasAudienceData = true;
    } else if (platformFollowers > 0) {
      audienceText = `${formatNumber(
        platformFollowers
      )} connected-platform followers are currently available for analysis.`;

      hasAudienceData = true;
    } else if (marketplaceFollowers > 0) {
      audienceText = `${formatNumber(
        marketplaceFollowers
      )} CreatorsHub marketplace followers are currently tracked. Connected audience data will improve this analysis.`;

      hasAudienceData = true;
    }

    evidence.push({
      id: "audience",
      title:
        platformSubscribers > 0
          ? `${formatNumber(platformSubscribers)} platform subscribers`
          : platformFollowers > 0
            ? `${formatNumber(platformFollowers)} platform followers`
            : marketplaceFollowers > 0
              ? `${formatNumber(marketplaceFollowers)} marketplace followers`
              : "Audience data is limited",
      detail:
        platformSubscribers > 0 || platformFollowers > 0
          ? "Connected audience data is currently available for analysis."
          : marketplaceFollowers > 0
            ? "Connecting audience platforms will improve audience intelligence."
            : "Connect YouTube, Twitch, Kick, or another audience platform to improve recommendations.",
      importance: hasAudienceData ? "medium" : "low",
    });
  }

  if (evidence.length < 3) {
    const commerceProducts =
      Number(commerce.products || 0);

    const marketplaceProducts =
      Number(productsCount || 0);

    const affectedPlatforms = Array.isArray(
      integrations.affectedPlatforms
    )
      ? integrations.affectedPlatforms
      : [];

    const affectedCommercePlatforms = affectedPlatforms.filter(
      (platform) =>
        ["shopify", "fourthwall", "gumroad"].includes(
          String(platform || "").toLowerCase()
        )
    );

    const hasCommerceIssue =
      affectedCommercePlatforms.length > 0;

    const affectedCommerceLabel =
      affectedCommercePlatforms
        .map(formatPlatformName)
        .join(", ");

    evidence.push({
      id: "commerce",
      title:
        commerceProducts > 0
          ? hasCommerceIssue
            ? `${formatNumber(
                commerceProducts
              )} previously synced commerce products`
            : `${formatNumber(
                commerceProducts
              )} connected commerce products`
          : `${formatNumber(
              marketplaceProducts
            )} marketplace products`,
      detail:
        commerceProducts > 0 && hasCommerceIssue
          ? `This commerce data may be outdated until ${
              affectedCommerceLabel || "the affected platform"
            } reconnects.`
          : commerceProducts > 0
            ? "Connected commerce data is currently available for analysis."
            : "Connect a commerce platform to add order and storefront intelligence.",
      importance: hasCommerceIssue ? "medium" : "low",
    });
  }

  return evidence.slice(0, 3);
}

function buildSnapshot({
  businessSummary,
  totalFollowers = 0,
  productsCount = 0,
} = {}) {
  const revenue = businessSummary?.revenue || {};
  const audience = businessSummary?.audience || {};
  const commerce = businessSummary?.commerce || {};
  const integrations = businessSummary?.integrations || {};

  const platformSubscribers = Number(
    audience.subscribers || 0
  );

  const platformFollowers = Number(
    audience.followers || 0
  );

  const marketplaceFollowers = Number(
    totalFollowers || 0
  );

  const audienceSnapshot =
    platformSubscribers > 0
      ? {
          label: "Platform Subscribers",
          value: formatNumber(platformSubscribers),
        }
      : platformFollowers > 0
        ? {
            label: "Platform Followers",
            value: formatNumber(platformFollowers),
          }
        : {
            label: "Marketplace Followers",
            value: formatNumber(marketplaceFollowers),
          };

  const connectedCommerceProducts = Number(
      commerce.products || 0
    );

    const marketplaceProducts = Number(
      productsCount || 0
    );

    const affectedPlatforms = Array.isArray(
      integrations.affectedPlatforms
    )
      ? integrations.affectedPlatforms
      : [];

    const hasCommerceConnectionIssue = affectedPlatforms.some(
      (platform) =>
        ["shopify", "fourthwall", "gumroad"].includes(
          String(platform || "").toLowerCase()
        )
    );

    const productSnapshot =
      connectedCommerceProducts > 0 &&
      !hasCommerceConnectionIssue
        ? {
            label: "Commerce Products",
            value: formatNumber(connectedCommerceProducts),
          }
        : {
            label: "Marketplace Products",
            value: formatNumber(marketplaceProducts),
          };

  return [
    {
      id: "revenue",
      label: "Lifetime Revenue",
      value: formatCurrency(revenue.total),
    },
    {
      id: "audience",
      label: audienceSnapshot.label,
      value: audienceSnapshot.value,
    },
    {
      id: "commerce",
      label: productSnapshot.label,
      value: productSnapshot.value,
    },
    {
      id: "connections",
      label: "Healthy Connections",
      value: `${Number(
        integrations.healthyConnections || 0
      )}/${Number(integrations.connectedAccounts || 0)}`,
    },
  ];
}

export function buildBusinessToday({
  businessSummary,
  businessSignals = [],
  businessCauses = [],
  hasCurrentMonthRevenueData = false,
  revenueThisMonth = 0,
  totalFollowers = 0,
  productsCount = 0,
} = {}) {
  const connectedAccounts = Number(
    businessSummary?.integrations?.connectedAccounts || 0
  );

  const priority = buildPriority({
    businessSignals,
    businessCauses,
    connectedAccounts,
  });

  return {
    generatedAt: new Date().toISOString(),

    priority,

    confidence: buildConfidence({
      businessSummary,
    }),

    evidence: buildEvidence({
      businessSummary,
      businessSignals,
      prioritySignalId: priority.id,
      hasCurrentMonthRevenueData,
      revenueThisMonth,
      totalFollowers,
      productsCount,
    }),

    snapshot: buildSnapshot({
      businessSummary,
      totalFollowers,
      productsCount,
    }),
  };
}

function formatPlatformName(platform) {
  const platformNames = {
    youtube: "YouTube",
    twitch: "Twitch",
    kick: "Kick",
    shopify: "Shopify",
    fourthwall: "Fourthwall",
    gumroad: "Gumroad",
    patreon: "Patreon",
    stripe: "Stripe",
    paypal: "PayPal",
    streamlabs: "Streamlabs",
    streamelements: "StreamElements",
  };

  const key = String(platform || "").toLowerCase();

  return (
    platformNames[key] ||
    String(platform || "")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (character) =>
        character.toUpperCase()
      )
  );
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value || 0));
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US", {
    notation:
      Number(value || 0) >= 10000
        ? "compact"
        : "standard",
    maximumFractionDigits: 1,
  }).format(Number(value || 0));
}