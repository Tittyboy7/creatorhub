export const RECOMMENDATION_PRIORITIES = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
};

export const RECOMMENDATION_STATUSES = {
  READY: "ready",
  WATCH: "watch",
  BLOCKED: "blocked",
};

export function createRecommendation({
  id,
  title,
  summary,
  reasoning,
  score = 0,
  priority = RECOMMENDATION_PRIORITIES.LOW,
  confidence = 0,
  evidence = [],
  suggestedTimeframe = null,
  status = RECOMMENDATION_STATUSES.READY,
  metadata = {},
}) {
  return {
    id,
    title,
    summary,
    reasoning,
    score,
    priority,
    confidence,
    evidence,
    suggestedTimeframe,
    status,
    metadata,
  };
}