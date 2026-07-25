import "server-only";

import OpenAI from "openai";

let openAIClient = null;

export function getOpenAIClient() {
  const apiKey =
    process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not configured."
    );
  }

  if (!openAIClient) {
    openAIClient = new OpenAI({
      apiKey,
    });
  }

  return openAIClient;
}

export function isOpenAIConfigured() {
  return Boolean(
    process.env.OPENAI_API_KEY
  );
}