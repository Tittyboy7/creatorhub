import { AI_CONFIDENCE_LEVELS } from "../types/analysisTypes";

export function createAIAnalysis({
  summary = "",
  topOpportunity = null,
  biggestRisk = null,
  recommendedActions = [],
  insights = [],
  confidence = AI_CONFIDENCE_LEVELS.MEDIUM,
} = {}) {
  return {
    summary,
    topOpportunity,
    biggestRisk,
    recommendedActions: Array.isArray(recommendedActions)
      ? recommendedActions
      : [],
    insights: Array.isArray(insights) ? insights : [],
    confidence,
  };
}