function formatPercent(value) {
  const roundedValue = Math.round(value || 0);

  if (roundedValue > 0) {
    return `+${roundedValue}%`;
  }

  return `${roundedValue}%`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function buildWhatHappened(context) {
  const performance = context.performance;

  const viewsChange = formatPercent(
    performance.views.change
  );

  const revenueChange = formatPercent(
    performance.revenue.change
  );

  if (
    performance.views.direction === "down" &&
    performance.revenue.direction === "down"
  ) {
    return `Audience reach declined ${viewsChange}, while revenue declined ${revenueChange} compared with the previous reporting period.`;
  }

  if (
    performance.views.direction === "up" &&
    performance.revenue.direction === "up"
  ) {
    return `Audience reach increased ${viewsChange}, while revenue increased ${revenueChange} compared with the previous reporting period.`;
  }

  if (
    performance.views.direction === "up" &&
    performance.revenue.direction !== "up"
  ) {
    return `Audience reach increased ${viewsChange}, but revenue changed only ${revenueChange}, creating a gap between attention and monetization.`;
  }

  if (
    performance.views.direction !== "up" &&
    performance.revenue.direction === "up"
  ) {
    return `Revenue increased ${revenueChange} even though audience reach changed ${viewsChange}, suggesting monetization improved independently of audience growth.`;
  }

  return `Overall business performance remained relatively stable compared with the previous reporting period.`;
}

function buildWhyItMatters(context) {
  const primaryDriver = context.primaryDriver;
  const highestRisk = context.risks?.[0];

  if (
    highestRisk &&
    highestRisk.severity !== "low"
  ) {
    return `${primaryDriver.explanation} ${highestRisk.explanation}`;
  }

  return primaryDriver.explanation;
}

function buildNextAction(context) {
  const highestPriorityOpportunity =
    context.opportunities?.find(
      (opportunity) =>
        opportunity.priority === "high"
    ) ||
    context.opportunities?.[0];

  if (highestPriorityOpportunity) {
    return {
      label: highestPriorityOpportunity.label,
      explanation:
        highestPriorityOpportunity.explanation,
      priority:
        highestPriorityOpportunity.priority ||
        "medium",
      type: highestPriorityOpportunity.type,
    };
  }

  return {
    label: "Maintain current strategy",
    explanation:
      "No urgent opportunity requires a major change. Continue monitoring performance and publishing consistently.",
    priority: "low",
    type: "maintain_strategy",
  };
}

function calculateConfidence(context) {
  const eventCount =
    context.activity?.totalEvents || 0;

  const hasPreviousPeriod =
    Boolean(
      context.evidence?.previousPeriod
    );

  const hasChanges =
    Boolean(context.evidence?.changes);

  let score = 70;

  if (hasPreviousPeriod) {
    score += 10;
  }

  if (hasChanges) {
    score += 10;
  }

  if (eventCount >= 4) {
    score += 5;
  }

  return Math.min(score, 95);
}

export default function buildBusinessBrief(
  context
) {
  if (!context?.performance) {
    return null;
  }

  const nextAction = buildNextAction(context);

  return {
    headline:
      context.performance.momentum === "declining"
        ? "Performance needs attention"
        : context.performance.momentum ===
            "softening"
          ? "Momentum is beginning to soften"
          : context.performance.momentum ===
              "surging"
            ? "Business momentum is surging"
            : context.performance.momentum ===
                "growing"
              ? "Business momentum is growing"
              : "Business performance is stable",

    whatHappened:
      buildWhatHappened(context),

    whyItMatters:
      buildWhyItMatters(context),

    nextAction,

    confidence: {
      score: calculateConfidence(context),
      label:
        calculateConfidence(context) >= 90
          ? "High confidence"
          : calculateConfidence(context) >= 75
            ? "Good confidence"
            : "Developing confidence",
    },

    evidence: [
      {
        label: "Current revenue",
        value: formatCurrency(
          context.performance.revenue.value
        ),
      },
      {
        label: "Revenue change",
        value: formatPercent(
          context.performance.revenue.change
        ),
      },
      {
        label: "Views change",
        value: formatPercent(
          context.performance.views.change
        ),
      },
      {
        label: "Subscriber growth change",
        value: formatPercent(
          context.performance.subscriberGrowth
            .change
        ),
      },
    ],
  };
}