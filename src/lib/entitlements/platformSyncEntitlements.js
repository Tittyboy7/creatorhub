const PLATFORM_SYNC_ENTITLEMENTS = {
  free: {
    manualSyncsPerDay: 1,
  },

  creator: {
    manualSyncsPerDay: 3,
  },

  pro: {
    manualSyncsPerDay: 10,
  },
};

export const DEFAULT_CREATORS_HUB_PLAN =
  "free";

export function getPlatformSyncEntitlement(
  planKey = DEFAULT_CREATORS_HUB_PLAN
) {
  const entitlement =
    PLATFORM_SYNC_ENTITLEMENTS[
      planKey
    ] ||
    PLATFORM_SYNC_ENTITLEMENTS[
      DEFAULT_CREATORS_HUB_PLAN
    ];

  return {
    planKey:
      PLATFORM_SYNC_ENTITLEMENTS[
        planKey
      ]
        ? planKey
        : DEFAULT_CREATORS_HUB_PLAN,

    manualSyncsPerDay:
      entitlement.manualSyncsPerDay,
  };
}