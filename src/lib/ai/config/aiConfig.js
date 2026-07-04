import { DEFAULT_AI_PROVIDER } from "../types/providerTypes";

export function getAIConfig() {
  return {
    provider: process.env.NEXT_PUBLIC_AI_PROVIDER || DEFAULT_AI_PROVIDER,
    realAIEnabled: process.env.NEXT_PUBLIC_USE_REAL_AI === "true",
  };
}