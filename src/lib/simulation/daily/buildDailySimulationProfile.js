import {
  DAYS_PER_WEEK,
  weeklyGrowthRateToDaily,
  weeklyProbabilityToDaily,
  weeklyValueToDaily,
} from "../time/convertTimeScale";

function clamp(
  value,
  minimum = 0,
  maximum = 1
) {
  return Math.min(
    maximum,
    Math.max(minimum, value)
  );
}

function weeklyVolatilityToDaily(
  weeklyVolatility = 0
) {
  if (
    typeof weeklyVolatility !== "number" ||
    !Number.isFinite(weeklyVolatility)
  ) {
    return 0;
  }

  return Math.max(
    0,
    weeklyVolatility /
      Math.sqrt(DAYS_PER_WEEK)
  );
}

function normalizeBehavior(
  behavior = {}
) {
  return {
    uploadConsistency: clamp(
      behavior.uploadConsistency || 0
    ),

    audienceLoyalty: clamp(
      behavior.audienceLoyalty || 0
    ),

    discoveryStrength: clamp(
      behavior.discoveryStrength || 0
    ),

    monetizationEfficiency: clamp(
      behavior.monetizationEfficiency || 0
    ),

    communityStrength: clamp(
      behavior.communityStrength || 0
    ),
  };
}

export default function buildDailySimulationProfile(
  creator
) {
  const simulation =
    creator?.simulation;

  const baseline =
    simulation?.baseline;

  if (!simulation || !baseline) {
    return null;
  }

  const growth =
    simulation.growth || {};

  const volatility =
    simulation.volatility || {};

  const events =
    simulation.events || {};

  const engagement =
    simulation.engagement || {};

  const shopify =
    creator?.platforms?.shopify;

  const shopifyCurrentPeriod =
    shopify?.currentPeriod || null;

  const twitch =
    creator?.platforms?.twitch;

  const twitchCurrentPeriod =
    twitch?.currentPeriod || null;

  return {
    source: "daily-profile",

    seed:
      simulation.seed || 1,

    baseline: {
      dailyYouTubeViews:
        weeklyValueToDaily(
          baseline.weeklyYouTubeViews
        ),

      dailySubscribersGained:
        weeklyValueToDaily(
          baseline.weeklySubscribersGained
        ),

      dailySubscribersLost:
        weeklyValueToDaily(
          baseline.weeklySubscribersLost
        ),

      dailyYouTubeRevenue:
        weeklyValueToDaily(
          baseline.weeklyYouTubeRevenue
        ),
    },

    commerce: shopifyCurrentPeriod
      ? {
          source: "shopify-current-period",

          periodDays: 28,

          baselineDailySessions:
            shopifyCurrentPeriod
              .conversionRate > 0
              ? (
                  shopifyCurrentPeriod.orders /
                  (
                    shopifyCurrentPeriod
                      .conversionRate /
                    100
                  )
                ) /
                28
              : 0,

          baselineConversionRate:
            shopifyCurrentPeriod
              .conversionRate || 0,

          baselineUnitsPerOrder:
            shopifyCurrentPeriod.orders > 0
              ? shopifyCurrentPeriod
                  .unitsSold /
                shopifyCurrentPeriod
                  .orders
              : 0,

          baselineAverageOrderValue:
            shopifyCurrentPeriod.orders > 0
              ? shopifyCurrentPeriod
                  .revenue /
                shopifyCurrentPeriod
                  .orders
              : 0,

          referencePeriod: {
            orders:
              shopifyCurrentPeriod.orders ||
              0,

            unitsSold:
              shopifyCurrentPeriod
                .unitsSold || 0,

            conversionRate:
              shopifyCurrentPeriod
                .conversionRate || 0,

            grossSales:
              shopifyCurrentPeriod.revenue ||
              0,
          },
        }
      : null,

    twitch: twitchCurrentPeriod
      ? {
          source:
            "twitch-current-period",

          periodDays: 28,

          referencePeriod: {
            streams:
              twitchCurrentPeriod.streams ||
              0,

            hoursStreamed:
              twitchCurrentPeriod
                .hoursStreamed || 0,

            averageConcurrentViewers:
              twitchCurrentPeriod
                .averageConcurrentViewers ||
              0,

            peakConcurrentViewers:
              twitchCurrentPeriod
                .peakConcurrentViewers ||
              0,

            uniqueViewers:
              twitchCurrentPeriod
                .uniqueViewers || 0,

            followersGained:
              twitchCurrentPeriod
                .followersGained || 0,

            subscriptions:
              twitchCurrentPeriod
                .subscriptions || 0,

            estimatedRevenue:
              twitchCurrentPeriod
                .estimatedRevenue || 0,
          },

          baselinePerStream: {
            hoursStreamed:
              twitchCurrentPeriod.streams > 0
                ? twitchCurrentPeriod
                    .hoursStreamed /
                  twitchCurrentPeriod
                    .streams
                : 0,

            uniqueViewers:
              twitchCurrentPeriod.streams > 0
                ? twitchCurrentPeriod
                    .uniqueViewers /
                  twitchCurrentPeriod
                    .streams
                : 0,

            followersGained:
              twitchCurrentPeriod.streams > 0
                ? twitchCurrentPeriod
                    .followersGained /
                  twitchCurrentPeriod
                    .streams
                : 0,

            subscriptions:
              twitchCurrentPeriod.streams > 0
                ? twitchCurrentPeriod
                    .subscriptions /
                  twitchCurrentPeriod
                    .streams
                : 0,

            revenue:
              twitchCurrentPeriod.streams > 0
                ? twitchCurrentPeriod
                    .estimatedRevenue /
                  twitchCurrentPeriod
                    .streams
                : 0,
          },

          audience: {
            averageConcurrentViewers:
              twitchCurrentPeriod
                .averageConcurrentViewers ||
              0,

            peakConcurrentViewers:
              twitchCurrentPeriod
                .peakConcurrentViewers ||
              0,

            peakToAverageRatio:
              twitchCurrentPeriod
                .averageConcurrentViewers > 0
                ? twitchCurrentPeriod
                    .peakConcurrentViewers /
                  twitchCurrentPeriod
                    .averageConcurrentViewers
                : 1,
          },

          volatility: {
            streamDuration: 0.08,
            averageViewers: 0.12,
            peakViewers: 0.14,
            uniqueViewers: 0.14,
            followers: 0.12,
            subscriptions: 0.12,
            revenue: 0.14,
          },

          carryover: {
            audience: 0.012,
            followers: 0.01,
            subscriptions: 0.01,
            revenue: 0.01,
          },
        }
      : null,

    engagement: {
      averageViewDurationSeconds:
        engagement.averageViewDurationSeconds ||
        0,

      averageViewDurationVolatility:
        engagement.averageViewDurationVolatility ||
        0,

      uploadDayMultiplier:
        engagement.uploadDayMultiplier ||
        1,

      streamDayMultiplier:
        engagement.streamDayMultiplier ||
        1,

      viralDayMultiplier:
        engagement.viralDayMultiplier ||
        1,
      
      minimumViewDurationSeconds:
        engagement.minimumViewDurationSeconds ||
        0,

      maximumViewDurationSeconds:
        engagement.maximumViewDurationSeconds ||
        Number.POSITIVE_INFINITY,
    },

    growth: {
      dailyAudienceGrowthRate:
        weeklyGrowthRateToDaily(
          growth.weeklyAudienceGrowthRate ||
            0
        ),

      dailyRevenueGrowthRate:
        weeklyGrowthRateToDaily(
          growth.weeklyRevenueGrowthRate ||
            0
        ),

      dailyEngagementGrowthRate:
        weeklyGrowthRateToDaily(
          growth.weeklyEngagementGrowthRate ||
            0
        ),
    },

    volatility: {
      views:
        weeklyVolatilityToDaily(
          volatility.views || 0
        ),

      subscribers:
        weeklyVolatilityToDaily(
          volatility.subscribers || 0
        ),

      revenue:
        weeklyVolatilityToDaily(
          volatility.revenue || 0
        ),
    },

    behavior:
      normalizeBehavior(
        simulation.behavior
      ),

    events: {
      viralVideoProbability:
        events.viralVideoProbability || 0,

      sponsorshipProbability:
        weeklyProbabilityToDaily(
          events.sponsorshipProbability ||
            0
        ),

      merchandiseLaunchProbability:
        weeklyProbabilityToDaily(
          events.merchandiseLaunchProbability ||
            0
        ),

      missedUploadProbability:
        events.missedUploadProbability ||
        0,
    },

    schedule: {
      uploadsPerWeek:
        creator?.business
          ?.uploadFrequencyPerWeek || 0,

      streamsPerWeek:
        creator?.business
          ?.streamFrequencyPerWeek || 0,
    },
  };
}