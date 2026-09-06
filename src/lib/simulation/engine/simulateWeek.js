import createSeededRandom from "./createSeededRandom";
import generateBusinessEvents from "./generateBusinessEvents";
import buildMomentumState from "./buildMomentumState";

function randomVariation(random, percent) {
  return (random() * 2 - 1) * percent;
}

function applyGrowth({
  value,
  growthRate,
  volatility,
  random,
}) {
  const growth = value * growthRate;
  const variation =
    value * randomVariation(random, volatility);

  return Math.max(
    0,
    Math.round(value + growth + variation)
  );
}

function getCombinedEventImpact(events) {
  return events.reduce(
    (combinedImpact, event) => {
      const impact = event?.impact || {};

      return {
        viewsMultiplier:
          combinedImpact.viewsMultiplier *
          (impact.viewsMultiplier || 1),

        watchTimeMultiplier:
          combinedImpact.watchTimeMultiplier *
          (impact.watchTimeMultiplier || 1),

        subscriberMultiplier:
          combinedImpact.subscriberMultiplier *
          (impact.subscriberMultiplier || 1),

        revenueMultiplier:
          combinedImpact.revenueMultiplier *
          (impact.revenueMultiplier || 1),

        sponsorshipRevenue:
          combinedImpact.sponsorshipRevenue +
          (impact.sponsorshipRevenue || 0),

        shopifyRevenueMultiplier:
          combinedImpact.shopifyRevenueMultiplier *
          (impact.shopifyRevenueMultiplier || 1),
      };
    },
    {
      viewsMultiplier: 1,
      watchTimeMultiplier: 1,
      subscriberMultiplier: 1,
      revenueMultiplier: 1,
      sponsorshipRevenue: 0,
      shopifyRevenueMultiplier: 1,
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
    Math.round(
      previousBaseline * (1 - carryoverRate) +
        finalValue * carryoverRate
    )
  );
}

export default function simulateWeek(
  creator,
  weekIndex = 1,
  previousState = null
) {
  const simulation = creator?.simulation;
  const originalBaseline = simulation?.baseline;

  if (!simulation || !originalBaseline) {
    return null;
  }

  const baseline =
    previousState?.baseline || originalBaseline;

  const creatorSeed = simulation.seed || 1;
  const weekSeed =
    creatorSeed + weekIndex * 1009;

  const random = createSeededRandom(weekSeed);

  const events = generateBusinessEvents(
    creator,
    weekIndex
  );

  const eventImpact =
    getCombinedEventImpact(events);

  const baseViews = applyGrowth({
    value: baseline.weeklyYouTubeViews,
    growthRate:
      simulation.growth.weeklyAudienceGrowthRate,
    volatility: simulation.volatility.views,
    random,
  });

  const baseWatchTimeHours = applyGrowth({
    value: baseline.weeklyWatchTimeHours,
    growthRate:
      simulation.growth.weeklyEngagementGrowthRate,
    volatility:
      simulation.volatility.engagement,
    random,
  });

  const baseSubscribersGained = applyGrowth({
    value: baseline.weeklySubscribersGained,
    growthRate:
      simulation.growth.weeklyAudienceGrowthRate,
    volatility:
      simulation.volatility.subscribers,
    random,
  });

  const subscribersLost = applyGrowth({
    value: baseline.weeklySubscribersLost,
    growthRate: 0,
    volatility:
      simulation.volatility.subscribers,
    random,
  });

  const baseYouTubeRevenue = applyGrowth({
    value: baseline.weeklyYouTubeRevenue,
    growthRate:
      simulation.growth.weeklyRevenueGrowthRate,
    volatility: simulation.volatility.revenue,
    random,
  });

  const views = Math.round(
    baseViews * eventImpact.viewsMultiplier
  );

  const watchTimeHours = Math.round(
    baseWatchTimeHours *
      eventImpact.watchTimeMultiplier
  );

  const subscribersGained = Math.round(
    baseSubscribersGained *
      eventImpact.subscriberMultiplier
  );

  const youtubeRevenue = Math.round(
    baseYouTubeRevenue *
      eventImpact.revenueMultiplier
  );

  const sponsorshipRevenue =
    eventImpact.sponsorshipRevenue;

  const totalRevenue =
    youtubeRevenue + sponsorshipRevenue;

  const momentum = buildMomentumState({
    creator,
    previousState,
    events,
  });  

  const nextState = {
    baseline: {
      weeklyYouTubeViews: blendBaseline({
        previousBaseline:
          baseline.weeklyYouTubeViews,
        finalValue: views,
        carryoverRate: 0.12,
      }),

      weeklyWatchTimeHours: blendBaseline({
        previousBaseline:
          baseline.weeklyWatchTimeHours,
        finalValue: watchTimeHours,
        carryoverRate: 0.12,
      }),

      weeklySubscribersGained: blendBaseline({
        previousBaseline:
          baseline.weeklySubscribersGained,
        finalValue: subscribersGained,
        carryoverRate: 0.1,
      }),

      weeklySubscribersLost: blendBaseline({
        previousBaseline:
          baseline.weeklySubscribersLost,
        finalValue: subscribersLost,
        carryoverRate: 0.05,
      }),

      weeklyYouTubeRevenue: blendBaseline({
        previousBaseline:
          baseline.weeklyYouTubeRevenue,
        finalValue: youtubeRevenue,
        carryoverRate: 0.1,
      }),
    },

    momentum,
  };

  return {
    weekIndex,

    views,
    watchTimeHours,

    subscribersGained,
    subscribersLost,

    netSubscriberGrowth:
      subscribersGained - subscribersLost,

    revenue: totalRevenue,

    revenueBreakdown: {
      youtube: youtubeRevenue,
      sponsorships: sponsorshipRevenue,
    },

    events,
    momentum,
    nextState,
  };
}