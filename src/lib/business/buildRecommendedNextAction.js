export function buildRecommendedNextAction({
  businessSignals = [],
  platform = null,
  revenueSummary = null,
} = {}) {
  const hasRevenueGrowth =
    revenueSummary?.monthlyGrowthPercent > 10;

  if (hasRevenueGrowth && platform?.key === "youtube") {
    return {
      title: "Revenue Intelligence",

      reason:
        "Your newest YouTube activity appears to be driving the strongest increase in business revenue.",

      href: "/revenue",

      buttonLabel: "Continue",

      accent: "green",
    };
  }

  const connectionIssue = businessSignals.find(
    (signal) => signal.type === "connection_issue"
  );

  if (connectionIssue) {
    return {
      title: "Platform Intelligence",

      reason:
        "One or more connected platforms are no longer providing current business data.",

      href: "/platforms",

      buttonLabel: "Continue",

      accent: "amber",
    };
  }

  return {
    title: "Compare Workspace",

    reason:
      "Comparing your connected platforms may reveal where your next growth opportunity is developing.",

    href: "/compare",

    buttonLabel: "Continue",

    accent: "violet",
  };
}