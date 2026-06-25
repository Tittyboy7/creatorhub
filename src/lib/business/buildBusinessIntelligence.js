export function buildBusinessIntelligence({
  signals = [],
  causes = [],
} = {}) {
  const highestPrioritySignal = signals[0];

  if (!highestPrioritySignal) {
    return {
      headline: "Welcome to CreatorsHub",
      summary:
        "Connect platforms and begin tracking revenue to receive personalized business intelligence.",
      recommendation:
        "Add your first revenue source to begin building your business profile.",
      priority: "low",

      action: {
        label: "Track Revenue",
        href: "/add-revenue",
      },

      metadata: {},
    };
  }

  const primaryCause = causes.find(
    (cause) =>
      cause.signalId === highestPrioritySignal.id &&
      cause.metadata?.primary
  );

  return {
    headline: highestPrioritySignal.title,

    summary:
      primaryCause?.explanation ||
      highestPrioritySignal.reason,

    recommendation:
      highestPrioritySignal.recommendation,

    priority:
      highestPrioritySignal.severity,

    action:
      highestPrioritySignal.action,

    metadata: {
      signalId: highestPrioritySignal.id,
      causeId: primaryCause?.id,
    },
  };
}