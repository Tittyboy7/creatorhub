import { getAIConfig } from "../config/aiConfig";
import { AI_PROVIDERS } from "../types/providerTypes";
import { mockAIProvider } from "./mockAIProvider";
import { openAIProvider } from "./openAIProvider";

const providers = {
  [AI_PROVIDERS.MOCK]: mockAIProvider,
  [AI_PROVIDERS.OPENAI]: openAIProvider,
};

export async function runAIProvider({
  provider,
  skillName,
  context,
  analysis = null,
  insights = [],
} = {}) {
  const config = getAIConfig();

  const requestedProvider = provider || config.provider;

  const safeProvider =
    config.realAIEnabled && requestedProvider === AI_PROVIDERS.OPENAI
      ? AI_PROVIDERS.OPENAI
      : AI_PROVIDERS.MOCK;

  const selectedProvider =
    providers[safeProvider] || providers[AI_PROVIDERS.MOCK];

  return selectedProvider({
    skillName,
    context,
    analysis,
    insights,
  });
}