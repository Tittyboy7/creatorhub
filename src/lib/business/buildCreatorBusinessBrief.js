export function buildCreatorBusinessBrief({
  businessSignals = [],
  businessCauses = [],
  revenueBrief = null,
} = {}) {
  const prioritySignals = getPrioritySignals(businessSignals);

  return {
    headline: buildHeadline({
      prioritySignals,
      revenueBrief,
    }),

    priorities: prioritySignals.map((signal) => ({
      id: signal.id,
      title: signal.title,
      category: signal.category,
      severity: signal.severity,
      reason: signal.reason,
      recommendation: signal.recommendation,
      action: signal.action,
      cause: businessCauses.find((cause) => cause.signalId === signal.id) || null,
    })),

    revenue: revenueBrief,

    confidence: buildConfidence({
      businessSignals,
      revenueBrief,
    }),
  };
}

function getPrioritySignals(signals = []) {
  return signals
    .filter((signal) =>
      ["growth", "risk", "opportunity", "stability"].includes(signal.category)
    )
    .slice(0, 3);
}

function buildHeadline({ prioritySignals, revenueBrief }) {
  const topSignal = prioritySignals[0];

  if (topSignal?.category === "risk") {
    return "A business risk needs your attention.";
  }

  if (topSignal?.category === "growth") {
    return "Your creator business is showing positive momentum.";
  }

  if (topSignal?.category === "opportunity") {
    return "A new business opportunity is available.";
  }

  return revenueBrief?.headline || "Your creator business brief is ready.";
}

function buildConfidence({ businessSignals, revenueBrief }) {
  if (businessSignals.length >= 3 && revenueBrief?.changes?.length >= 3) {
    return "high";
  }

  if (businessSignals.length > 0 || revenueBrief?.changes?.length > 0) {
    return "medium";
  }

  return "low";
}