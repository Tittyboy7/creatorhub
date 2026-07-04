import { createAIResponse } from "./createAIResponse";

export async function mockAIProvider({
  skillName,
  context,
  analysis = null,
  insights = [],
}) {
  return createAIResponse({
    provider: "mock",
    skillName,
    context,
    analysis,
    insights,
  });
}