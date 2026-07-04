import { getAIConfig } from "./aiConfig";

export function getAIDebugInfo() {
  const config = getAIConfig();

  return {
    provider: config.provider,
    realAIEnabled: config.realAIEnabled,
    mode: config.realAIEnabled ? "real" : "mock",
  };
}