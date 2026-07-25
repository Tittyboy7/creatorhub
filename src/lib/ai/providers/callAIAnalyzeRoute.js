const SUPPORTED_SERVER_PROVIDERS = [
  "server-mock",
  "openai",
];

function normalizeProvider(provider) {
  return SUPPORTED_SERVER_PROVIDERS.includes(
    provider
  )
    ? provider
    : "server-mock";
}

export async function callAIAnalyzeRoute({
  skillName,
  context,
  provider = "server-mock",
} = {}) {
  const response = await fetch(
    "/api/ai/analyze",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        skillName,
        context,

        provider:
          normalizeProvider(provider),
      }),
    }
  );

  let result = null;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      "The AI server returned an invalid response."
    );
  }

  if (!response.ok) {
    const serverMessage =
      result?.error ||
      "The AI analysis request failed.";

    const error = new Error(
      serverMessage
    );

    error.status = response.status;
    error.details =
      result?.details || null;

    throw error;
  }

  return result;
}