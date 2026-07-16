function getConfidenceLabel({
  score,
  connectionsNeedingAttention,
}) {
  if (connectionsNeedingAttention > 0) {
    return "Needs attention";
  }

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
      connectionsNeedingAttention,
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
    return {
      id: "business-foundation",
      eyebrow: "Today’s Priority",
      title: "Build a stronger business data foundation",
      explanation:
        "Connect platforms and track revenue consistently so CreatorsHub can identify stronger risks and opportunities.",
      action: {
        label:
          connectedAccounts > 0
            ? "Open Revenue Intelligence"
            : "Connect a Platform",
        href:
          connectedAccounts > 0
            ? "/revenue"
            : "/connected-accounts",
      },
      severity: "low",
    };
  }

  return {
    id: signal.id,
    eyebrow: "Today’s Priority",
    title: signal.title,
    explanation:
      cause?.explanation ||
      signal.reason ||
      signal.recommendation,
    action: signal.action || {
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
      text: `Revenue increased ${monthlyGrowthPercent}% compared with the previous tracked month.`,
      importance: "medium",
    });
  } else if (monthlyGrowthPercent < 0) {
    evidence.push({
      id: "revenue-decline",
      text: `Revenue decreased ${Math.abs(
        monthlyGrowthPercent
      )}% compared with the previous tracked month.`,
      importance: "high",
    });
  } else if (hasCurrentMonthRevenueData) {
    evidence.push({
      id: "revenue-current-month",
      text: `${formatCurrency(
        revenueThisMonth
      )} has been recorded this month.`,
      importance: "low",
    });
  } else {
    evidence.push({
      id: "revenue-missing-current-month",
      text:
        "No current-month revenue entry has been recorded yet.",
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
        text: signal.reason || signal.title,
        importance:
          signal.severity === "high"
            ? "high"
            : signal.severity === "medium"
              ? "medium"
              : "low",
      });
    });

  if (evidence.length < 3) {
    const audienceCount =
      Number(audience.subscribers || 0) ||
      Number(audience.followers || 0) ||
      Number(totalFollowers || 0);

    evidence.push({
      id: "audience",
      text:
        audienceCount > 0
          ? `${formatNumber(
              audienceCount
            )} audience members are currently available for analysis.`
          : "Audience data is currently limited.",
      importance: audienceCount > 0 ? "medium" : "low",
    });
  }

  if (evidence.length < 3) {
    const commerceProducts =
      Number(commerce.products || 0);

    const marketplaceProducts =
      Number(productsCount || 0);

    const affectedPlatforms =
      integrations.affectedPlatforms || [];

    const hasCommerceIssue = affectedPlatforms.some(
      (platform) =>
        ["shopify", "fourthwall", "gumroad"].includes(
          String(platform || "").toLowerCase()
        )
    );

    evidence.push({
      id: "commerce",
      text:
        commerceProducts > 0
          ? hasCommerceIssue
            ? `${formatNumber(
                commerceProducts
              )} previously synced commerce products may be outdated.`
            : `${formatNumber(
                commerceProducts
              )} connected commerce products are available for analysis.`
          : `${formatNumber(
              marketplaceProducts
            )} marketplace products are currently listed.`,
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

  const audienceCount =
    Number(audience.subscribers || 0) ||
    Number(audience.followers || 0) ||
    Number(totalFollowers || 0);

  const productCount =
    Number(commerce.products || 0) ||
    Number(productsCount || 0);

  return [
    {
      id: "revenue",
      label: "Tracked Revenue",
      value: formatCurrency(revenue.total),
    },
    {
      id: "audience",
      label: "Audience",
      value: formatNumber(audienceCount),
    },
    {
      id: "commerce",
      label: "Products",
      value: formatNumber(productCount),
    },
    {
      id: "connections",
      label: "Healthy Platforms",
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