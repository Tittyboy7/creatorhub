import { callAIAnalyzeRoute } from "./callAIAnalyzeRoute";
import { createAIResponse } from "./createAIResponse";

export async function openAIProvider({
  skillName,
  context,
  analysis = null,
  insights = [],
}) {
  try {
    const routeResult = await callAIAnalyzeRoute({
      skillName,
      context,
    });

    return createAIResponse({
      provider: routeResult?.provider || "openai",
      skillName,
      context,
      analysis,
      insights,
      raw: routeResult,
    });
  } catch (error) {
    console.error("OpenAI provider placeholder failed:", error);

    return createAIResponse({
      provider: "openai",
      skillName,
      context,
      analysis,
      insights,
      raw: {
        error: "OpenAI placeholder failed.",
      },
    });
  }
}