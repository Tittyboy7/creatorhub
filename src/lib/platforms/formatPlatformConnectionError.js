function getParsedError(
  value
) {
  if (!value) {
    return null;
  }

  if (
    typeof value ===
    "object"
  ) {
    return value;
  }

  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  try {
    return JSON.parse(
      value
    );
  } catch {
    return null;
  }
}

export default function formatPlatformConnectionError({
  platformKey,
  error,
  connectionStatus,
} = {}) {
  if (
    connectionStatus ===
    "reauth_required"
  ) {
    return `Your ${
      platformKey || "platform"
    } connection has expired. Reconnect it to resume syncing.`;
  }

  if (!error) {
    return null;
  }

  const parsed =
    getParsedError(
      error
    );

  const parsedMessage =
    parsed?.error ||
    parsed?.errors ||
    parsed?.message ||
    null;

  const rawMessage =
    parsedMessage ||
    (typeof error ===
    "string"
      ? error
      : "");

  const normalizedMessage =
    String(
      rawMessage
    ).toLowerCase();

  if (
    platformKey ===
      "shopify" &&
    normalizedMessage.includes(
      "unavailable shop"
    )
  ) {
    return "Shopify could not access this store. Review the connection and try again.";
  }

  if (
    normalizedMessage.includes(
      "refresh token"
    ) ||
    normalizedMessage.includes(
      "authentication expired"
    ) ||
    normalizedMessage.includes(
      "unauthorized"
    )
  ) {
    return "Your connection has expired. Reconnect this platform to resume syncing.";
  }

  return "CreatorsHub could not refresh this platform. Your previously synced data is still available.";
}