import createSeededRandom from "../engine/createSeededRandom";
import buildMomentumState from "../engine/buildMomentumState";
import generateDailyBusinessEvents from "./generateDailyBusinessEvents";
import simulateTwitchDay from "./platforms/twitch/simulateTwitchDay";

function randomVariation(
  random,
  percent
) {
  return (
    (random() * 2 - 1) *
    percent
  );
}

function applyGrowth({
  value,
  growthRate,
  volatility,
  random,
}) {
  const growth =
    value * growthRate;

  const variation =
    value *
    randomVariation(
      random,
      volatility
    );

  return Math.max(
    0,
    Math.round(
      value +
        growth +
        variation
    )
  );
}

function getCombinedEventImpact(
  events
) {
  return events.reduce(
    (combinedImpact, event) => {
      const impact =
        event?.impact || {};

      return {
        viewsMultiplier:
          combinedImpact
            .viewsMultiplier *
          (impact.viewsMultiplier ||
            1),

        watchTimeMultiplier:
          combinedImpact
            .watchTimeMultiplier *
          (impact.watchTimeMultiplier ||
            1),

        subscriberMultiplier:
          combinedImpact
            .subscriberMultiplier *
          (impact.subscriberMultiplier ||
            1),

        revenueMultiplier:
          combinedImpact
            .revenueMultiplier *
          (impact.revenueMultiplier ||
            1),

        sponsorshipRevenue:
          combinedImpact
            .sponsorshipRevenue +
          (impact.sponsorshipRevenue ||
            0),

        commerceMultiplier:
          combinedImpact
            .commerceMultiplier *
          (impact.commerceMultiplier ||
            1),
      };
    },
    {
      viewsMultiplier: 1,
      watchTimeMultiplier: 1,
      subscriberMultiplier: 1,
      revenueMultiplier: 1,
      sponsorshipRevenue: 0,
      commerceMultiplier: 1,
    }
  );
}

function blendBaseline({
  previousBaseline,
  finalValue,
  carryoverRate,
}) {
  return Math.max(
    0,
    previousBaseline *
      (1 - carryoverRate) +
      finalValue *
        carryoverRate
  );
}

function buildDailyMomentumState({
  creator,
  previousState,
  events,
}) {
  /*
   * buildMomentumState was originally
   * designed around weekly iterations.
   *
   * For this first daily engine we only
   * allow meaningful events to influence
   * momentum. Routine daily activity
   * should not repeatedly inflate it.
   */
  const meaningfulEvents =
    events.filter(
      (event) =>
        event.type !==
          "content_published" &&
        event.type !==
          "stream_completed"
    );

  return buildMomentumState({
    creator,
    previousState,
    events: meaningfulEvents,
  });
}

function clamp(
  value,
  minimum,
  maximum
) {
  return Math.min(
    maximum,
    Math.max(minimum, value)
  );
}

function buildAverageViewDuration({
  dailyProfile,
  day,
  events,
  random,
}) {
  const engagement =
    dailyProfile.engagement || {};

  const baselineDuration =
    engagement.averageViewDurationSeconds ||
    0;

  const volatility =
    engagement.averageViewDurationVolatility ||
    0;

  let multiplier =
    1 +
    randomVariation(
      random,
      volatility
    );

  if (day.scheduledUpload) {
    multiplier *=
      engagement.uploadDayMultiplier ||
      1;
  }

  if (day.scheduledStream) {
    multiplier *=
      engagement.streamDayMultiplier ||
      1;
  }

  const hasViralVideo =
    events.some(
      (event) =>
        event.type === "viral_video"
    );

  if (hasViralVideo) {
    multiplier *=
      engagement.viralDayMultiplier ||
      1;
  }

  return Math.round(
    clamp(
      baselineDuration * multiplier,

      engagement.minimumViewDurationSeconds ||
        0,

      engagement.maximumViewDurationSeconds ||
        Number.POSITIVE_INFINITY
    )
  );
}

function buildShopifyDay({
  dailyProfile,
  previousState,
  eventImpact,
  random,
}) {
  const commerce =
    dailyProfile.commerce;

  if (!commerce) {
    return null;
  }

  const previousCommerceBaseline =
    previousState?.commerceBaseline || {
      dailySessions:
        commerce.baselineDailySessions || 0,

      conversionRate:
        commerce.baselineConversionRate || 0,

      unitsPerOrder:
        commerce.baselineUnitsPerOrder || 0,

      averageOrderValue:
        commerce.baselineAverageOrderValue || 0,
    };

  const behavior =
    dailyProfile.behavior || {};

  const previousCommerceMomentum =
    previousState?.momentum?.commerce ??
    0.25;

  /*
   * Store demand responds to:
   *
   * - ordinary daily variation
   * - community strength
   * - monetization efficiency
   * - existing commerce momentum
   * - merchandise events
   *
   * The adjustments are deliberately
   * restrained so normal days remain
   * close to the creator's baseline.
   */
  const sessionVariation =
    randomVariation(
      random,
      (
        dailyProfile.volatility
          ?.revenue || 0
      ) * 0.65
    );

  const behaviorDemandAdjustment =
    (
      (
        (behavior.communityStrength ||
          0.5) -
        0.5
      ) *
      0.08
    ) +
    (
      (
        (behavior.monetizationEfficiency ||
          0.5) -
        0.5
      ) *
      0.05
    );

  const momentumDemandAdjustment =
    (
      previousCommerceMomentum -
      0.25
    ) * 0.15;

  const sessions =
    Math.max(
      0,
      Math.round(
        previousCommerceBaseline
          .dailySessions *
          (
            1 +
            sessionVariation +
            behaviorDemandAdjustment +
            momentumDemandAdjustment
          ) *
          (
            eventImpact
              .commerceMultiplier || 1
          )
      )
    );

  /*
   * Conversion moves much less than
   * traffic. It should remain fairly
   * stable day to day.
   */
  const conversionVariation =
    randomVariation(
      random,
      0.045
    );

  const conversionAdjustment =
    (
      (
        (behavior.monetizationEfficiency ||
          0.5) -
        0.5
      ) *
      0.08
    ) +
    (
      (
        previousCommerceMomentum -
        0.25
      ) *
      0.08
    );

  const conversionRate =
    clamp(
      previousCommerceBaseline
        .conversionRate *
        (
          1 +
          conversionVariation +
          conversionAdjustment
        ),
      0.25,
      15
    );

  const orders =
    Math.max(
      0,
      Math.round(
        sessions *
          (
            conversionRate /
            100
          )
      )
    );

  /*
   * Basket size and order value move
   * independently but stay close to
   * their baseline relationships.
   */
  const unitsPerOrder =
    Math.max(
      1,
      previousCommerceBaseline
        .unitsPerOrder *
        (
          1 +
          randomVariation(
            random,
            0.04
          )
        )
    );

  const averageOrderValue =
    Math.max(
      0,
      previousCommerceBaseline
        .averageOrderValue *
        (
          1 +
          randomVariation(
            random,
            0.035
          )
        )
    );

  const unitsSold =
    orders > 0
      ? Math.max(
          orders,
          Math.round(
            orders *
              unitsPerOrder
          )
        )
      : 0;

  const grossSales =
    orders > 0
      ? Math.round(
          orders *
            averageOrderValue
        )
      : 0;

  return {
    sessions,
    conversionRate,
    orders,
    unitsSold,
    unitsPerOrder,
    averageOrderValue,
    grossSales,

    nextBaseline: {
      dailySessions:
        blendBaseline({
          previousBaseline:
            previousCommerceBaseline
              .dailySessions,
          finalValue:
            sessions,
          carryoverRate:
            0.01,
        }),

      conversionRate:
        blendBaseline({
          previousBaseline:
            previousCommerceBaseline
              .conversionRate,
          finalValue:
            conversionRate,
          carryoverRate:
            0.012,
        }),

      unitsPerOrder:
        blendBaseline({
          previousBaseline:
            previousCommerceBaseline
              .unitsPerOrder,
          finalValue:
            unitsPerOrder,
          carryoverRate:
            0.01,
        }),

      averageOrderValue:
        blendBaseline({
          previousBaseline:
            previousCommerceBaseline
              .averageOrderValue,
          finalValue:
            averageOrderValue,
          carryoverRate:
            0.01,
        }),
    },
  };
}

export default function simulateDay({
  creator,
  dailyProfile,
  day,
  previousState = null,
}) {
  if (
    !creator ||
    !dailyProfile ||
    !day
  ) {
    return null;
  }

  const originalBaseline =
    dailyProfile.baseline;

  if (!originalBaseline) {
    return null;
  }

  const baseline =
    previousState?.baseline ||
    originalBaseline;

  const seed =
    dailyProfile.seed || 1;

  const daySeed =
    seed +
    day.dayIndex * 1009 +
    17011;

  const random =
    createSeededRandom(
      daySeed
    );

  const events =
    generateDailyBusinessEvents({
      creator,
      dailyProfile,
      day,
    });

  const eventImpact =
    getCombinedEventImpact(
      events
    );

  const baseViews =
    applyGrowth({
      value:
        baseline.dailyYouTubeViews,

      growthRate:
        dailyProfile.growth
          .dailyAudienceGrowthRate,

      volatility:
        dailyProfile.volatility
          .views,

      random,
    });

  const baseSubscribersGained =
    applyGrowth({
      value:
        baseline
          .dailySubscribersGained,

      growthRate:
        dailyProfile.growth
          .dailyAudienceGrowthRate,

      volatility:
        dailyProfile.volatility
          .subscribers,

      random,
    });

  const subscribersLost =
    applyGrowth({
      value:
        baseline
          .dailySubscribersLost,

      growthRate: 0,

      volatility:
        dailyProfile.volatility
          .subscribers,

      random,
    });

  const baseYouTubeRevenue =
    applyGrowth({
      value:
        baseline
          .dailyYouTubeRevenue,

      growthRate:
        dailyProfile.growth
          .dailyRevenueGrowthRate,

      volatility:
        dailyProfile.volatility
          .revenue,

      random,
    });

  const views =
    Math.round(
      baseViews *
        eventImpact
          .viewsMultiplier
    );

  const averageViewDurationSeconds =
    buildAverageViewDuration({
      dailyProfile,
      day,
      events,
      random,
    });

  const watchTimeHours =
    Math.round(
      (
        views *
        averageViewDurationSeconds
      ) /
        3600
    );  

  const subscribersGained =
    Math.round(
      baseSubscribersGained *
        eventImpact
          .subscriberMultiplier
    );

  const youtubeRevenue =
    Math.round(
      baseYouTubeRevenue *
        eventImpact
          .revenueMultiplier
    );

  const sponsorshipRevenue =
    eventImpact
      .sponsorshipRevenue;

  const totalRevenue =
    youtubeRevenue +
    sponsorshipRevenue;

  const shopifyDay =
    buildShopifyDay({
      dailyProfile,
      previousState,
      eventImpact,
      random,
    });

  const twitchDay =
    simulateTwitchDay({
      dailyProfile,
      day,
      previousState,
      random,
    });

  const momentum =
    buildDailyMomentumState({
      creator,
      previousState,
      events,
    });

  const nextState = {
    baseline: {
      dailyYouTubeViews:
        blendBaseline({
          previousBaseline:
            baseline
              .dailyYouTubeViews,

          finalValue:
            views,

          carryoverRate:
            0.04,
        }),

      dailySubscribersGained:
        blendBaseline({
          previousBaseline:
            baseline
              .dailySubscribersGained,

          finalValue:
            subscribersGained,

          carryoverRate:
            0.035,
        }),

      dailySubscribersLost:
        blendBaseline({
          previousBaseline:
            baseline
              .dailySubscribersLost,

          finalValue:
            subscribersLost,

          carryoverRate:
            0.015,
        }),

      dailyYouTubeRevenue:
        blendBaseline({
          previousBaseline:
            baseline
              .dailyYouTubeRevenue,

          finalValue:
            youtubeRevenue,

          carryoverRate:
            0.035,
        }),
    },

    commerceBaseline:
      shopifyDay?.nextBaseline ||
      previousState?.commerceBaseline ||
      null,

    twitchBaseline:
      twitchDay?.nextBaseline ||
      previousState?.twitchBaseline ||
      null,

    momentum,
  };

  return {
    dayIndex:
      day.dayIndex,

    date:
      day.date,

    dayName:
      day.dayName,

    weekIndex:
      day.weekIndex,

    scheduledUpload:
      Boolean(
        day.scheduledUpload
      ),

    scheduledStream:
      Boolean(
        day.scheduledStream
      ),

    views,

    watchTimeHours,

    averageViewDurationSeconds,

    subscribersGained,
    subscribersLost,

    netSubscriberGrowth:
      subscribersGained -
      subscribersLost,

    revenue:
      totalRevenue,

    revenueBreakdown: {
      youtube:
        youtubeRevenue,

      sponsorships:
        sponsorshipRevenue,
    },

    shopify: shopifyDay
      ? {
          sessions:
            shopifyDay.sessions,

          conversionRate:
            shopifyDay.conversionRate,

          orders:
            shopifyDay.orders,

          unitsSold:
            shopifyDay.unitsSold,

          unitsPerOrder:
            shopifyDay.unitsPerOrder,

          averageOrderValue:
            shopifyDay.averageOrderValue,

          grossSales:
            shopifyDay.grossSales,
        }
      : null,

    twitch: twitchDay
      ? {
          streamedToday:
            twitchDay.streamedToday,

          hoursStreamed:
            twitchDay.hoursStreamed,

          averageConcurrentViewers:
            twitchDay
              .averageConcurrentViewers,

          peakConcurrentViewers:
            twitchDay
              .peakConcurrentViewers,

          uniqueViewers:
            twitchDay.uniqueViewers,

          followersGained:
            twitchDay.followersGained,

          subscriptions:
            twitchDay.subscriptions,

          revenue:
            twitchDay.revenue,
        }
      : null,

    events,

    momentum,

    nextState,
  };
}