function createValidationResult({
  isValid,
  errors = [],
  warnings = [],
}) {
  return {
    isValid,
    errors,
    warnings,
  };
}

export default function validateBusinessBriefContext(
  context
) {
  const errors = [];
  const warnings = [];

  if (!context || typeof context !== "object") {
    return createValidationResult({
      isValid: false,
      errors: [
        "A valid AI business context is required.",
      ],
    });
  }

  if (!context.creator) {
    errors.push(
      "Creator information is missing."
    );
  }

  if (!context.intelligence) {
    errors.push(
      "Business intelligence is missing."
    );
  }

  if (!context.brief) {
    errors.push(
      "The creator business brief is missing."
    );
  }

  if (
    context.brief &&
    !context.brief.whatHappened
  ) {
    errors.push(
      'The brief is missing "what happened" information.'
    );
  }

  if (
    context.brief &&
    !context.brief.whyItMatters
  ) {
    errors.push(
      'The brief is missing "why it matters" information.'
    );
  }

  if (
    context.brief &&
    !context.brief.nextAction
  ) {
    errors.push(
      "The brief is missing a recommended next action."
    );
  }

  if (!context.workspaceScope) {
    warnings.push(
      "Workspace scope is missing. The explanation may be less specific."
    );
  }

  if (
    !context.dataSummary
      ?.hasBusinessIntelligence
  ) {
    warnings.push(
      "The context does not report business intelligence as available."
    );
  }

  if (
    !context.dataSummary?.hasBusinessBrief
  ) {
    warnings.push(
      "The context does not report a business brief as available."
    );
  }

  const confidenceScore =
    context.brief?.confidence?.score;

  if (
    typeof confidenceScore === "number" &&
    confidenceScore < 75
  ) {
    warnings.push(
      "The supplied business brief has limited confidence. The response should communicate uncertainty."
    );
  }

  return createValidationResult({
    isValid: errors.length === 0,
    errors,
    warnings,
  });
}