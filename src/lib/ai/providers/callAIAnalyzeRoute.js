export async function callAIAnalyzeRoute({ skillName, context } = {}) {
  const response = await fetch("/api/ai/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      skillName,
      context,
    }),
  });

  if (!response.ok) {
    throw new Error("AI analyze route request failed.");
  }

  return response.json();
}