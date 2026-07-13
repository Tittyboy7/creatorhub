export async function getConnectedAccountIdFromRequest(request) {
  if (!request) {
    return {
      connectedAccountId: null,
      error: new Error("Missing integration request."),
    };
  }

  const body = await request.json().catch(() => ({}));
  const connectedAccountId = body?.connectedAccountId;

  if (
    !connectedAccountId ||
    typeof connectedAccountId !== "string"
  ) {
    return {
      connectedAccountId: null,
      error: new Error("Missing connected account ID."),
    };
  }

  return {
    connectedAccountId,
    error: null,
  };
}