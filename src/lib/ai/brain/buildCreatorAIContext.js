export function buildCreatorAIContext({
  summary = "",
  healthScore = null,
  opportunity = null,
  risk = null,
  priorities = [],
  recommendations = [],
  supportingInsights = [],
  confidence = "medium",
} = {}) {
  return {
    generatedAt: new Date().toISOString(),

    summary,

    healthScore,

    opportunity,

    risk,

    priorities: Array.isArray(priorities)
      ? priorities
      : [],

    recommendations: Array.isArray(recommendations)
      ? recommendations
      : [],

    supportingInsights: Array.isArray(supportingInsights)
      ? supportingInsights
      : [],

    confidence,
  };
}