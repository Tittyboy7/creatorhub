import { createAIAnalysis } from "./createAIAnalysis";

export function buildRevenueAnalysis({ revenueSummary }) {
  if (!revenueSummary?.hasRevenueValues) {
    return createAIAnalysis({
      summary:
        "This widget does not have enough revenue data yet to generate a useful business snapshot.",
      topOpportunity: null,
      biggestRisk: {
        title: "Not enough data yet",
        summary:
          "More revenue history is needed before this widget can reveal reliable opportunities or risks.",
      },
      recommendedActions: [
        "Connect more platforms.",
        "Import more revenue history.",
        "Review this widget again after more data is available.",
      ],
      confidence: "low",
    });
  }

  const volatilityMessage = revenueSummary.hasHighVolatility
    ? "Your revenue changes significantly across this widget, which means one or more moments performed much better than the rest."
    : "Your revenue looks relatively stable across this widget, which can make planning and forecasting easier.";

  return createAIAnalysis({
    summary: `This widget includes ${revenueSummary.rowCount} data points and approximately ${formatCurrency(
      revenueSummary.totalRevenue
    )} in tracked revenue. ${volatilityMessage}`,
    topOpportunity: {
      title: revenueSummary.hasHighVolatility
        ? "Repeat your strongest success"
        : "Strengthen your reliable revenue streams",
      summary: revenueSummary.hasHighVolatility
        ? "Your strongest revenue spike likely came from a specific campaign, product launch, sponsorship, or content strategy. Understanding what drove that success gives you the best chance of repeating it."
        : "Stable revenue patterns can reveal which platforms or business systems are dependable. Improving those reliable streams can create stronger long-term growth.",
    },
    biggestRisk: {
      title: revenueSummary.hasHighVolatility
        ? "Your income is inconsistent"
        : "Growth may be flattening",
      summary: revenueSummary.hasHighVolatility
        ? "Your income varies significantly across this time period. Consistent revenue is usually easier to grow than unpredictable spikes, so understanding what caused the fluctuations should be a priority."
        : "If revenue is stable but not growing quickly, look for opportunities to improve conversion, retention, or your platform mix.",
    },
    recommendedActions: revenueSummary.hasHighVolatility
      ? [
          "Identify what caused the highest revenue spike.",
          "Compare the spike against content, product launches, sponsorships, or platform events.",
          "Create a repeatable playbook from the strongest performing moment.",
        ]
      : [
          "Review which platform contributes the most consistent revenue.",
          "Look for small improvements that could compound over time.",
          "Compare this widget against audience and commerce metrics next.",
        ],
    confidence: revenueSummary.rowCount >= 12 ? "high" : "medium",
  });
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}