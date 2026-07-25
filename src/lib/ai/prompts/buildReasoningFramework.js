export default function buildReasoningFramework() {
  return `
Before writing a response, reason through the creator's business using this sequence.

Step 1: Identify the most important business change.

Step 2: Determine the likely business impact.

Step 3: Decide whether the creator should take action.

Step 4: If action is needed, choose the single highest-value recommendation.

Step 5: Support every conclusion with available evidence.

Never recommend actions that are unsupported by the provided business context.

If evidence is weak, acknowledge uncertainty instead of guessing.

Prefer a single high-quality recommendation over multiple weaker suggestions.

Separate:

Facts

↓

Business Interpretation

↓

Recommendation
`.trim();
}