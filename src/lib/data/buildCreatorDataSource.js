import buildSimulationSnapshot from "@/lib/simulation/buildSimulationSnapshot";
import buildYouTubePlatformData from "@/lib/simulation/adapters/youtube/buildPlatformData";

function applyMultiplier(value, multiplier = 1) {
  return Math.max(
    0,
    Math.round((value || 0) * multiplier)
  );
}

function buildAccountSimulationCreator({
  creator,
  account,
  primaryYouTubeAccount,
}) {
  const simulationProfile =
    account.simulationProfile || {};

  const originalSimulation =
    creator.simulation;

  const originalBaseline =
    originalSimulation.baseline;

  const accountYouTubeData = {
    ...primaryYouTubeAccount,
    ...account,

    lifetime: {
      ...primaryYouTubeAccount?.lifetime,
      ...account?.lifetime,
    },

    currentPeriod: {
      ...primaryYouTubeAccount?.currentPeriod,
      ...account?.currentPeriod,
    },

    previousPeriod: {
      ...primaryYouTubeAccount?.previousPeriod,
      ...account?.previousPeriod,
    },
  };

  return {
    ...creator,

    simulation: {
      ...originalSimulation,

      seed:
        (originalSimulation.seed || 1) +
        (simulationProfile.seedOffset || 0),

      baseline: {
        ...originalBaseline,

        weeklyYouTubeViews: applyMultiplier(
          originalBaseline.weeklyYouTubeViews,
          simulationProfile.weeklyViewMultiplier
        ),

        weeklyWatchTimeHours: applyMultiplier(
          originalBaseline.weeklyWatchTimeHours,
          simulationProfile.weeklyWatchTimeMultiplier
        ),

        weeklySubscribersGained: applyMultiplier(
          originalBaseline.weeklySubscribersGained,
          simulationProfile.weeklySubscriberMultiplier
        ),

        weeklySubscribersLost: applyMultiplier(
          originalBaseline.weeklySubscribersLost,
          simulationProfile.weeklySubscriberMultiplier
        ),

        weeklyYouTubeRevenue: applyMultiplier(
          originalBaseline.weeklyYouTubeRevenue,
          simulationProfile.weeklyRevenueMultiplier
        ),
      },
    },

    platforms: {
      ...creator.platforms,
      youtube: accountYouTubeData,
    },
  };
}

function buildYouTubeAccountRecord({
  creator,
  account,
  primaryYouTubeAccount,
  simulationOptions,
}) {
  const accountCreator =
    buildAccountSimulationCreator({
      creator,
      account,
      primaryYouTubeAccount,
    });

  const simulation =
    buildSimulationSnapshot(
      accountCreator,
      simulationOptions
    );

  if (!simulation) {
    return null;
  }

  const platformData =
    buildYouTubePlatformData({
      creator: accountCreator,
      simulation,
    });

  if (!platformData) {
    return null;
  }

  return {
    platform: "youtube",

    accountId:
      platformData.accountId ||
      account.accountId,

    accountName:
      platformData.accountName ||
      account.accountName,

    accountHandle:
      platformData.accountHandle ||
      account.accountHandle ||
      null,

    isPrimary:
      account.isPrimary === true,

    status:
      platformData.status || "connected",

    dataSource: "simulation",

    data: platformData,

    reporting: {
      weeks: simulation.weeks,

      currentPeriod:
        simulation.currentPeriod,

      previousPeriod:
        simulation.previousPeriod,

      changes:
        simulation.changes,
    },

    intelligence: {
      context: simulation.context,
      brief: simulation.brief,
    },

    simulation,

    metadata: {
      deterministic: true,
      seed: simulation.creator.seed,
    },
  };
}

function groupAccountsByPlatform(accounts) {
  return accounts.reduce(
    (groupedAccounts, account) => {
      const platform = account.platform;

      if (!groupedAccounts[platform]) {
        groupedAccounts[platform] = [];
      }

      groupedAccounts[platform].push(account);

      return groupedAccounts;
    },
    {}
  );
}

function buildPrimaryAccountIds(accounts) {
  return accounts.reduce(
    (primaryAccounts, account) => {
      if (
        account.isPrimary &&
        !primaryAccounts[account.platform]
      ) {
        primaryAccounts[account.platform] =
          account.accountId;
      }

      return primaryAccounts;
    },
    {}
  );
}

function buildSimulationDataSource({
  creator,
  simulationOptions,
}) {
  const primaryYouTubeAccount =
    creator?.platforms?.youtube;

  if (!primaryYouTubeAccount) {
    return null;
  }

  const configuredYouTubeAccounts =
    creator.platforms.youtubeAccounts?.length
      ? creator.platforms.youtubeAccounts
      : [
          {
            ...primaryYouTubeAccount,
            isPrimary: true,

            simulationProfile: {
              seedOffset: 0,
              weeklyViewMultiplier: 1,
              weeklyWatchTimeMultiplier: 1,
              weeklySubscriberMultiplier: 1,
              weeklyRevenueMultiplier: 1,
            },
          },
        ];

  const accounts =
    configuredYouTubeAccounts
      .map((account) =>
        buildYouTubeAccountRecord({
          creator,
          account,
          primaryYouTubeAccount,
          simulationOptions,
        })
      )
      .filter(Boolean);

  if (!accounts.length) {
    return null;
  }

  const accountsByPlatform =
    groupAccountsByPlatform(accounts);

  const primaryAccountIds =
    buildPrimaryAccountIds(accounts);

  const primaryYouTubeRecord =
    accounts.find(
      (account) =>
        account.platform === "youtube" &&
        account.isPrimary
    ) ||
    accountsByPlatform.youtube?.[0] ||
    null;

  const platforms = {
    ...(primaryYouTubeRecord
      ? {
          youtube:
            primaryYouTubeRecord.data,

          youtubeAccounts:
            accountsByPlatform.youtube.map(
              (account) => account.data
            ),
        }
      : {}),
  };

  const normalizedCreator = {
    ...creator,

    platforms: {
      ...creator.platforms,
      ...platforms,
    },
  };

  return {
    source: "simulation",

    status: "ready",

    creator: normalizedCreator,

    /*
     * Backward-compatible primary account data.
     */
    platforms,

    /*
     * Account-aware data.
     */
    accounts,

    accountsByPlatform,

    primaryAccountIds,

    intelligence:
      primaryYouTubeRecord?.intelligence || {
        context: null,
        brief: null,
      },

    reporting:
      primaryYouTubeRecord?.reporting || {
        weeks: [],
        currentPeriod: null,
        previousPeriod: null,
        changes: null,
      },

    simulation:
      primaryYouTubeRecord?.simulation || null,

    metadata: {
      generated: true,
      deterministic: true,

      seed:
        primaryYouTubeRecord?.metadata?.seed ||
        null,

      accountCount: accounts.length,

      platformCount:
        Object.keys(
          accountsByPlatform
        ).length,
    },
  };
}

export default function buildCreatorDataSource({
  creator,
  source = "simulation",
  simulationOptions = {},
} = {}) {
  if (!creator) {
    return null;
  }

  if (source === "simulation") {
    return buildSimulationDataSource({
      creator,
      simulationOptions,
    });
  }

  return {
    source,
    status: "unsupported",

    creator,

    platforms: {},

    accounts: [],

    accountsByPlatform: {},

    primaryAccountIds: {},

    intelligence: {
      context: null,
      brief: null,
    },

    reporting: {
      weeks: [],
      currentPeriod: null,
      previousPeriod: null,
      changes: null,
    },

    simulation: null,

    metadata: {
      generated: false,
      deterministic: false,
      seed: null,
      accountCount: 0,
      platformCount: 0,
    },
  };
}