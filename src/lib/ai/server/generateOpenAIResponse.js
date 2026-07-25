import "server-only";

import {
  getOpenAIClient,
  isOpenAIConfigured,
} from "./getOpenAIClient";

function isRealAIEnabled() {
  return (
    process.env
      .CREATORSHUB_REAL_AI_ENABLED ===
    "true"
  );
}

function getOpenAIModel() {
  return (
    process.env.OPENAI_MODEL ||
    "gpt-5-mini"
  );
}

export function getRealAIStatus() {
  return {
    enabled: isRealAIEnabled(),
    configured: isOpenAIConfigured(),
    model: getOpenAIModel(),

    ready:
      isRealAIEnabled() &&
      isOpenAIConfigured(),
  };
}

export async function generateOpenAIResponse({
  systemPrompt,
  userPrompt,
  metadata = {},
} = {}) {
  const status = getRealAIStatus();

  if (!status.enabled) {
    throw new Error(
      "Real AI is disabled by the CreatorsHub safety switch."
    );
  }

  if (!status.configured) {
    throw new Error(
      "OpenAI is not configured. OPENAI_API_KEY is missing."
    );
  }

  if (
    typeof systemPrompt !== "string" ||
    !systemPrompt.trim()
  ) {
    throw new Error(
      "A valid system prompt is required."
    );
  }

  if (
    typeof userPrompt !== "string" ||
    !userPrompt.trim()
  ) {
    throw new Error(
      "A valid user prompt is required."
    );
  }

  const client = getOpenAIClient();

  const startedAt = Date.now();

  const response =
    await client.responses.create({
      model: status.model,

      instructions:
        systemPrompt.trim(),

      input: userPrompt.trim(),

      store: false,

      metadata: {
        application: "creatorshub",
        feature: "business-brief",
        environment:
          process.env.NODE_ENV ||
          "unknown",

        ...metadata,
      },
    });

  const text =
    typeof response.output_text ===
    "string"
      ? response.output_text.trim()
      : "";

  if (!text) {
    throw new Error(
      "OpenAI returned an empty response."
    );
  }

  return {
    ok: true,
    provider: "openai",
    model: status.model,

    text,

    responseId:
      response.id || null,

    usage: response.usage
      ? {
          inputTokens:
            response.usage
              .input_tokens ?? null,

          outputTokens:
            response.usage
              .output_tokens ?? null,

          totalTokens:
            response.usage
              .total_tokens ?? null,
        }
      : null,

    durationMs:
      Date.now() - startedAt,

    metadata: {
      externalProviderCalled: true,
      paidRequestMade: true,
      storedByRequest: false,
    },
  };
}