import { AI_PROVIDERS } from "../types/providerTypes";

export function getAIProviderLabel(provider) {
  if (provider === AI_PROVIDERS.OPENAI) return "OpenAI";
  if (provider === AI_PROVIDERS.MOCK) return "Mock AI";

  return "AI";
}