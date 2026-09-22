export const PLATFORM_HUB_HEALTH_SCENARIOS = {
  healthy: {
    youtube: {
      status: "healthy",
      attentionReason: null,
    },

    shopify: {
      status: "healthy",
      attentionReason: null,
    },

    twitch: {
      status: "healthy",
      attentionReason: null,
    },
  },

  shopifyAttention: {
    shopify: {
      status: "attention",
      attentionReason:
        "Shopify performance has weakened and should be reviewed.",
    },
  },

  youtubeAttention: {
    youtube: {
      status: "attention",
      attentionReason:
        "YouTube performance has weakened and should be reviewed.",
    },
  },

  multipleAttention: {
    youtube: {
      status: "attention",
      attentionReason:
        "YouTube performance has weakened and should be reviewed.",
    },

    shopify: {
      status: "attention",
      attentionReason:
        "Shopify performance has weakened and should be reviewed.",
    },
  },
};

export function getPlatformHubHealthScenario(
  scenarioKey
) {
  if (!scenarioKey) {
    return null;
  }

  return (
    PLATFORM_HUB_HEALTH_SCENARIOS[
      scenarioKey
    ] || null
  );
}