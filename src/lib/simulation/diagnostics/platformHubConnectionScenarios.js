export const PLATFORM_HUB_CONNECTION_SCENARIOS = {
  healthy: {
    youtube: {
      status: "connected",
      error: null,
    },

    shopify: {
      status: "connected",
      error: null,
    },

    twitch: {
      status: "connected",
      error: null,
    },
  },

  partialFailure: {
    youtube: {
      status: "connected",
      error: null,
    },

    shopify: {
      status: "sync_error",
      error:
        "Shopify could not access this store. Review the connection and try again.",
    },

    twitch: {
      status: "connected",
      error: null,
    },
  },

  reauthRequired: {
    youtube: {
      status: "connected",
      error: null,
    },

    shopify: {
      status: "connected",
      error: null,
    },

    twitch: {
      status: "reauth_required",
      error:
        "Your Twitch connection has expired. Reconnect Twitch to resume syncing.",
    },
  },

  allBroken: {
    youtube: {
      status: "sync_error",
      error:
        "CreatorsHub could not refresh YouTube.",
    },

    shopify: {
      status: "sync_error",
      error:
        "CreatorsHub could not refresh Shopify.",
    },

    twitch: {
      status: "reauth_required",
      error:
        "Your Twitch connection has expired. Reconnect Twitch to resume syncing.",
    },
  },

  mixedIssues: {
    youtube: {
      status: "connected",
      error: null,
    },

    shopify: {
      status: "sync_error",
      error:
        "CreatorsHub could not refresh Shopify.",
    },

    twitch: {
      status: "reauth_required",
      error:
        "Your Twitch connection has expired. Reconnect Twitch to resume syncing.",
    },
  },
};

export function getPlatformHubConnectionScenario(
  scenarioKey
) {
  if (!scenarioKey) {
    return null;
  }

  return (
    PLATFORM_HUB_CONNECTION_SCENARIOS[
      scenarioKey
    ] || null
  );
}