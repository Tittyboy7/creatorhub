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

export const RECOMMENDATION_SCORE_WEIGHTS = {
  impact: 0.4,
  urgency: 0.3,
  confidence: 0.2,
  evidence: 0.1,
};

export const RECOMMENDATION_PRIORITY_BONUSES = {
  high: 10,
  medium: 5,
  low: 0,
};

export const MINIMUM_RECOMMENDATION_SCORE = 40;

export function clampRecommendationScore(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.min(100, Math.max(0, numericValue));
}

export function getEvidenceStrength(evidence) {
  if (!Array.isArray(evidence) || evidence.length === 0) {
    return 0;
  }

  const validEvidenceCount = evidence.filter((item) => {
    if (!item || typeof item !== "object") {
      return false;
    }

    return Boolean(
      item.label &&
      item.value !== undefined &&
      item.value !== null
    );
  }).length;

  if (validEvidenceCount >= 4) {
    return 100;
  }

  if (validEvidenceCount === 3) {
    return 85;
  }

  if (validEvidenceCount === 2) {
    return 70;
  }

  if (validEvidenceCount === 1) {
    return 50;
  }

  return 0;
}

export function getRecommendationPriority(score) {
  const normalizedScore =
    clampRecommendationScore(score);

  if (normalizedScore >= 75) {
    return RECOMMENDATION_PRIORITIES.HIGH;
  }

  if (normalizedScore >= 55) {
    return RECOMMENDATION_PRIORITIES.MEDIUM;
  }

  return RECOMMENDATION_PRIORITIES.LOW;
}