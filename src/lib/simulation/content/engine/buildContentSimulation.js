import buildBusinessAssessment from "@/lib/simulation/intelligence/buildBusinessAssessment";

const DEFAULT_MOMENTUM = {
  audience: 0.5,
  content: 0.5,
  revenue: 0.5,
  creator: 0.5,
  sponsorship: 0.25,
  commerce: 0.25,
};

function clamp(
  value,
  minimum = 0,
  maximum = Number.POSITIVE_INFINITY
) {
  return Math.min(
    maximum,
    Math.max(minimum, value)
  );
}

function getLatestMomentum(simulation) {
  const weeks =
    simulation?.weeks ||
    simulation?.history?.weeks ||
    [];

  const latestWeek =
    weeks[weeks.length - 1];

  return {
    ...DEFAULT_MOMENTUM,
    ...(latestWeek?.momentum || {}),
  };
}

function getPerformanceTierInfluence(asset) {
  switch (
    asset?.businessContext?.performanceTier
  ) {
    case "top-performer":
      return 0.12;

    case "strong":
      return 0.06;

    case "evergreen":
      return 0.04;

    case "average":
      return -0.02;

    default:
      return 0;
  }
}

function calculateMultiplier({
  asset,
  momentum,
}) {
  const audienceInfluence =
    (momentum.audience - 0.5) * 0.35;

  const contentInfluence =
    (momentum.content - 0.5) * 0.4;

  const creatorInfluence =
    (momentum.creator - 0.5) * 0.15;

  const tierInfluence =
    getPerformanceTierInfluence(asset);

  return clamp(
    1 +
      audienceInfluence +
      contentInfluence +
      creatorInfluence +
      tierInfluence,
    0.65,
    1.75
  );
}

function calculateRevenueMultiplier({
  asset,
  momentum,
  performanceMultiplier,
}) {
  const revenueInfluence =
    (momentum.revenue - 0.5) * 0.25;

  const sponsorshipInfluence =
    asset?.businessContext
      ?.primaryGoal === "sponsorship"
      ? (momentum.sponsorship - 0.25) *
        0.15
      : 0;

  return clamp(
    performanceMultiplier +
      revenueInfluence +
      sponsorshipInfluence,
    0.6,
    2
  );
}

function buildMomentumEvidence(momentum) {
  const evidence = [];

  const details = momentum.details || {};

  if (
    details.content?.direction === "up"
  ) {
    evidence.push({
      type: "content_momentum",
      label: "Content momentum increased",
      description:
        "Recent publishing activity and content events strengthened expected asset performance.",
    });
  }

  if (
    details.audience?.direction === "up"
  ) {
    evidence.push({
      type: "audience_momentum",
      label: "Audience momentum increased",
      description:
        "Audience activity is creating stronger discovery and viewing conditions.",
    });
  }

  if (
    details.revenue?.direction === "up"
  ) {
    evidence.push({
      type: "revenue_momentum",
      label: "Revenue momentum increased",
      description:
        "Current business conditions support stronger monetization performance.",
    });
  }

  const eventDrivers =
    momentum.drivers || [];

  eventDrivers.forEach((driver) => {
    evidence.push({
      type: driver.type,
      label: driver.label,
      description: driver.description,
    });
  });

  return evidence;
}

function scaleMetric(
  value,
  multiplier
) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return value;
  }

  return Math.max(
    0,
    Math.round(value * multiplier)
  );
}

function simulateAssetPerformance({
  asset,
  momentum,
}) {
  const performanceMultiplier =
    calculateMultiplier({
      asset,
      momentum,
    });

  const revenueMultiplier =
    calculateRevenueMultiplier({
      asset,
      momentum,
      performanceMultiplier,
    });

  const currentPeriod =
    asset.currentPeriod || {};

  const simulatedAsset = {
    ...asset,

    currentPeriod: {
      ...currentPeriod,

      views: scaleMetric(
        currentPeriod.views,
        performanceMultiplier
      ),

      watchTimeHours: scaleMetric(
        currentPeriod.watchTimeHours,
        performanceMultiplier
      ),

      impressions: scaleMetric(
        currentPeriod.impressions,
        performanceMultiplier
      ),

      likes: scaleMetric(
        currentPeriod.likes,
        performanceMultiplier
      ),

      comments: scaleMetric(
        currentPeriod.comments,
        performanceMultiplier
      ),

      subscribersGained: scaleMetric(
        currentPeriod.subscribersGained,
        performanceMultiplier
      ),

      estimatedRevenue: scaleMetric(
        currentPeriod.estimatedRevenue,
        revenueMultiplier
      ),
    },

    simulation: {
      generated: true,

      source: "momentum-engine",

      performanceMultiplier,

      revenueMultiplier,

      momentum: {
        audience: momentum.audience,
        content: momentum.content,
        revenue: momentum.revenue,
        creator: momentum.creator,
        sponsorship:
          momentum.sponsorship,
        commerce: momentum.commerce,
      },

      evidence:
        buildMomentumEvidence(momentum),
    },
  };

  return {
    ...simulatedAsset,

    assessment:
      buildBusinessAssessment(
        simulatedAsset
      ),
  };
}

export default function buildContentSimulation({
  creator,
  simulation,
  content = [],
}) {
  if (
    !creator ||
    !simulation ||
    !Array.isArray(content)
  ) {
    return [];
  }

  const momentum =
    getLatestMomentum(simulation);

  return content.map((asset) =>
    simulateAssetPerformance({
      asset,
      momentum,
    })
  );
}