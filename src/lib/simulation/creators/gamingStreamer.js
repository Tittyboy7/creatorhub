const gamingStreamer = {
  id: "creator-001",

  profile: {
    name: "Alex Carter",
    username: "alexplays",
    niche: "Gaming",
    creatorType: "Gaming Streamer",
    yearsCreating: 4,

    description:
      "A family-friendly gaming creator who publishes long-form videos and streams several times per week.",

    traits: [
      "Consistent publishing schedule",
      "Strong community engagement",
      "Above-average audience retention",
      "Growing merchandise business",
      "Limited sponsorship revenue",
    ],
  },

  business: {
    primaryPlatform: "youtube",

    connectedPlatforms: [
      "youtube",
      "twitch",
      "patreon",
      "shopify",
      "streamlabs",
    ],

    uploadFrequencyPerWeek: 2,
    streamFrequencyPerWeek: 4,
    merchandiseProductCount: 15,

    estimatedMonthlyRevenue: 6500,

    goals: [
      "Increase monthly sponsorship revenue",
      "Grow recurring membership revenue",
      "Convert more viewers into merchandise customers",
    ],
  },

  simulation: {
    seed: 1001,

    baseline: {
      weeklyYouTubeViews: 105450,
      weeklyWatchTimeHours: 12330,
      weeklySubscribersGained: 346,
      weeklySubscribersLost: 57,
      weeklyYouTubeRevenue: 719,
    },

    behavior: {
      uploadConsistency: 0.92,
      audienceLoyalty: 0.74,
      discoveryStrength: 0.68,
      monetizationEfficiency: 0.61,
      communityStrength: 0.81,
    },

    growth: {
      weeklyAudienceGrowthRate: 0.009,
      weeklyRevenueGrowthRate: 0.007,
      weeklyEngagementGrowthRate: 0.004,
    },

    volatility: {
      views: 0.12,
      subscribers: 0.1,
      revenue: 0.14,
      engagement: 0.08,
    },

    events: {
      viralVideoProbability: 0.025,
      sponsorshipProbability: 0.08,
      missedUploadProbability: 0.04,
      merchandiseLaunchProbability: 0.03,
    },
  },

  platforms: {
    youtube: {
      accountId: "youtube-alexplays-main",
      isPrimary: true,

      status: "connected",
      accountName: "Alex Plays",
      accountHandle: "@alexplays",

      lifetime: {
        subscribers: 48392,
        views: 6418500,
        videosPublished: 486,
      },

      currentPeriod: {
        periodLabel: "Last 28 days",
        views: 421800,
        watchTimeHours: 49320,
        subscribersGained: 1384,
        subscribersLost: 226,
        netSubscriberGrowth: 1158,
        videosPublished: 8,
        averageViewDurationSeconds: 522,
        clickThroughRate: 6.8,
        estimatedRevenue: 2875,
      },

      previousPeriod: {
        periodLabel: "Previous 28 days",
        views: 363620,
        watchTimeHours: 41790,
        subscribersGained: 1087,
        subscribersLost: 211,
        netSubscriberGrowth: 876,
        videosPublished: 7,
        averageViewDurationSeconds: 478,
        clickThroughRate: 6.1,
        estimatedRevenue: 2410,
      },
    },

    youtubeAccounts: [
      {
        accountId: "youtube-alexplays-main",
        isPrimary: true,

        status: "connected",
        accountName: "Alex Plays",
        accountHandle: "@alexplays",

        simulationProfile: {
          seedOffset: 0,
          weeklyViewMultiplier: 1,
          weeklyWatchTimeMultiplier: 1,
          weeklySubscriberMultiplier: 1,
          weeklyRevenueMultiplier: 1,
        },
      },

      {
        accountId: "youtube-alexplays-shorts",
        isPrimary: false,

        status: "connected",
        accountName: "Alex Plays Shorts",
        accountHandle: "@alexplaysshorts",

        simulationProfile: {
          seedOffset: 5000,
          weeklyViewMultiplier: 0.72,
          weeklyWatchTimeMultiplier: 0.18,
          weeklySubscriberMultiplier: 0.64,
          weeklyRevenueMultiplier: 0.22,
        },

        lifetime: {
          subscribers: 18640,
          views: 9875000,
          videosPublished: 312,
        },

        currentPeriod: {
          periodLabel: "Last 28 days",
          views: 294600,
          watchTimeHours: 8860,
          subscribersGained: 812,
          subscribersLost: 146,
          netSubscriberGrowth: 666,
          videosPublished: 24,
          averageViewDurationSeconds: 108,
          clickThroughRate: 7.4,
          estimatedRevenue: 635,
        },

        previousPeriod: {
          periodLabel: "Previous 28 days",
          views: 271900,
          watchTimeHours: 8170,
          subscribersGained: 704,
          subscribersLost: 139,
          netSubscriberGrowth: 565,
          videosPublished: 22,
          averageViewDurationSeconds: 104,
          clickThroughRate: 7.1,
          estimatedRevenue: 574,
        },
      },
    ],

    twitch: {
      status: "connected",
      accountName: "AlexPlaysLive",

      currentPeriod: {
        streams: 16,
        hoursStreamed: 71,
        averageConcurrentViewers: 742,
        peakConcurrentViewers: 1684,
        uniqueViewers: 28450,
        followersGained: 934,
        subscriptions: 1280,
        estimatedRevenue: 1625,
      },
    },

    patreon: {
      status: "connected",
      accountName: "Alex Plays Community",

      currentPeriod: {
        activeMembers: 418,
        newMembers: 31,
        canceledMembers: 24,
        monthlyRecurringRevenue: 1045,
      },
    },

    shopify: {
      status: "connected",
      storeName: "Alex Plays Merch",

      currentPeriod: {
        orders: 126,
        unitsSold: 174,
        conversionRate: 2.9,
        revenue: 785,
      },
    },

    streamlabs: {
      status: "connected",

      currentPeriod: {
        donations: 94,
        uniqueDonors: 67,
        averageDonation: 6.85,
        revenue: 644,
      },
    },
  },
};

export default gamingStreamer;