function formatGoals(goals = []) {
  if (!Array.isArray(goals) || goals.length === 0) {
    return "None supplied";
  }

  return goals
    .slice(0, 3)
    .map((goal) => `- ${goal}`)
    .join("\n");
}

function formatItems(items = [], limit = 2) {
  if (!Array.isArray(items) || items.length === 0) {
    return "None";
  }

  return items
    .slice(0, limit)
    .map((item) => {
      const label =
        item?.label ||
        item?.title ||
        "Unnamed item";

      const explanation =
        item?.explanation ||
        item?.description ||
        "";

      return explanation
        ? `- ${label}: ${explanation}`
        : `- ${label}`;
    })
    .join("\n");
}

function formatEvidence(evidence = []) {
  if (!Array.isArray(evidence) || evidence.length === 0) {
    return "None";
  }

  return evidence
    .slice(0, 4)
    .map(
      (item) =>
        `- ${item.label}: ${item.value}`
    )
    .join("\n");
}

function formatWorkspaceScope(scope) {
  if (!scope) {
    return "Not specified";
  }

  const platform =
    scope.platform || "unknown platform";

  const account =
    scope.accountName ||
    scope.accountId ||
    "all accounts";

  return `${platform} — ${account}`;
}

export default function buildBusinessBriefUserPrompt(
  context
) {
  const creatorName =
    context?.creator?.displayName ||
    context?.creator?.username ||
    "Creator";

  const brief = context?.brief || {};
  const intelligence =
    context?.intelligence || {};

  return `
Explain the following CreatorsHub business brief to ${creatorName}.

Workspace
${formatWorkspaceScope(
  context?.workspaceScope
)}

Creator goals
${formatGoals(
  context?.creator?.goals
)}

CreatorsHub conclusion
Headline: ${brief.headline || "No headline supplied"}

What happened:
${brief.whatHappened || "Not available"}

Why it matters:
${brief.whyItMatters || "Not available"}

Recommended action:
${brief.nextAction?.label || "No action supplied"}
${brief.nextAction?.explanation || ""}

Key risks
${formatItems(
  intelligence.risks,
  2
)}

Key opportunities
${formatItems(
  intelligence.opportunities,
  2
)}

Evidence
${formatEvidence(
  brief.evidence
)}

Write a concise explanation of no more than 200 words.

Requirements:
- Do not invent or recalculate metrics.
- Do not contradict the CreatorsHub conclusion.
- Avoid repeating the same point in different words.
- Be direct, practical, and encouraging without exaggeration.
- Explain what changed, why it matters, and the single best next action.
- End with one specific recommendation.
`.trim();
}