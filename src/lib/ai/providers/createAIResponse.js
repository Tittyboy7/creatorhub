export function createAIResponse({
  provider = "mock",
  skillName,
  context = null,
  analysis = null,
  insights = [],
  raw = null,
} = {}) {
  return {
    provider,
    skillName,
    generatedAt: new Date().toISOString(),
    context,
    analysis,
    insights: Array.isArray(insights) ? insights : [],
    raw,
  };
}