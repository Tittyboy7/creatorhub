function getPerformanceHealth(asset) {
  const views =
    asset?.currentPeriod?.views || 0;

  if (views >= 90000) {
    return "excellent";
  }

  if (views >= 65000) {
    return "strong";
  }

  if (views >= 45000) {
    return "healthy";
  }

  if (views >= 30000) {
    return "average";
  }

  return "needs-attention";
}

function getConfidence(asset) {
  const evidence =
    asset?.simulation?.evidence || [];

  if (evidence.length >= 5) {
    return 0.95;
  }

  if (evidence.length >= 3) {
    return 0.9;
  }

  if (evidence.length >= 2) {
    return 0.82;
  }

  return 0.75;
}

function buildSummary(health) {
  switch (health) {
    case "excellent":
      return "This asset is substantially outperforming expectations.";

    case "strong":
      return "This asset is performing above your normal range.";

    case "healthy":
      return "This asset is performing consistently with your strongest recent uploads.";

    case "average":
      return "Performance is stable but there is room for improvement.";

    default:
      return "This asset is currently underperforming and deserves attention.";
  }
}

function buildRecommendation(asset) {
  return (
    asset?.businessContext?.recommendation ||
    "Continue monitoring this asset."
  );
}

export default function buildBusinessAssessment(
  asset
) {
  const health =
    getPerformanceHealth(asset);

  return {
    health,

    confidence: getConfidence(asset),

    summary: buildSummary(health),

    recommendation:
      buildRecommendation(asset),

    evidence:
      asset?.simulation?.evidence || [],
  };
}