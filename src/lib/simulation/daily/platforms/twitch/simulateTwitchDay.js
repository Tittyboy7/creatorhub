function clamp(
  value,
  minimum = 0,
  maximum = Number.POSITIVE_INFINITY
) {
  return Math.min(
    maximum,
    Math.max(minimum, value)
  );
}

function randomVariation(
  random,
  percent
) {
  return (
    (random() * 2 - 1) *
    percent
  );
}

function applyVariation({
  value,
  volatility,
  random,
}) {
  return Math.max(
    0,
    value *
      (
        1 +
        randomVariation(
          random,
          volatility
        )
      )
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

function buildInitialBaseline(
  twitchProfile
) {
  return {
    hoursStreamed:
      twitchProfile
        .baselinePerStream
        ?.hoursStreamed || 0,

    averageConcurrentViewers:
      twitchProfile
        .audience
        ?.averageConcurrentViewers || 0,

    uniqueViewers:
      twitchProfile
        .baselinePerStream
        ?.uniqueViewers || 0,

    followersGained:
      twitchProfile
        .baselinePerStream
        ?.followersGained || 0,

    subscriptions:
      twitchProfile
        .baselinePerStream
        ?.subscriptions || 0,

    revenue:
      twitchProfile
        .baselinePerStream
        ?.revenue || 0,
  };
}

export default function simulateTwitchDay({
  dailyProfile,
  day,
  previousState = null,
  random,
}) {
  const twitchProfile =
    dailyProfile?.twitch;

  if (
    !twitchProfile ||
    !day ||
    typeof random !== "function"
  ) {
    return null;
  }

  const previousBaseline =
    previousState
      ?.twitchBaseline ||
    buildInitialBaseline(
      twitchProfile
    );

  const behavior =
    dailyProfile.behavior || {};

  const volatility =
    twitchProfile.volatility || {};

  const carryover =
    twitchProfile.carryover || {};

  const streamedToday =
    Boolean(
      day.scheduledStream
    );

  if (!streamedToday) {
    return {
      streamedToday: false,

      hoursStreamed: 0,
      averageConcurrentViewers: 0,
      peakConcurrentViewers: 0,
      uniqueViewers: 0,
      followersGained: 0,
      subscriptions: 0,
      revenue: 0,

      nextBaseline:
        previousBaseline,
    };
  }

  const audienceQuality =
    (
      (
        behavior.communityStrength ||
        0.5
      ) -
      0.5
    ) *
      0.04 +
    (
      (
        behavior.audienceLoyalty ||
        0.5
      ) -
      0.5
    ) *
      0.03;
 
  const followerConversionStrength =
    (
      (
        behavior.communityStrength ||
        0.5
      ) -
      0.5
    ) *
      0.06;
 
  const monetizationStrength =
    (
      (
        behavior.monetizationEfficiency ||
        0.5
      ) -
      0.5
    ) *
      0.06;

  const hoursStreamed =
    clamp(
      applyVariation({
        value:
          previousBaseline
            .hoursStreamed,
        volatility:
          volatility.streamDuration ||
          0,
        random,
      }),
      1,
      12
    );

  const averageConcurrentViewers =
    Math.round(
      clamp(
        applyVariation({
          value:
            previousBaseline
              .averageConcurrentViewers,

          volatility:
            volatility.averageViewers ||
            0,

          random,
        }),
        0
      )
    );

  const peakToAverageRatio =
    twitchProfile.audience
      ?.peakToAverageRatio ||
    1;

  const peakConcurrentViewers =
    Math.max(
      averageConcurrentViewers,

      Math.round(
        applyVariation({
          value:
            averageConcurrentViewers *
            peakToAverageRatio,

          volatility:
            volatility.peakViewers ||
            0,

          random,
        })
      )
    );

  const uniqueViewers =
    Math.round(
      clamp(
        applyVariation({
          value:
            previousBaseline
              .uniqueViewers *
            (
              1 +
              audienceQuality
            ),

          volatility:
            volatility.uniqueViewers ||
            0,

          random,
        }),
        averageConcurrentViewers
      )
    );

  const followersGained =
    Math.round(
      clamp(
        applyVariation({
          value:
            previousBaseline
              .followersGained *
            (
              1 +
              followerConversionStrength
            ),

          volatility:
            volatility.followers ||
            0,

          random,
        }),
        0
      )
    );

  const subscriptions =
    Math.round(
      clamp(
        applyVariation({
          value:
            previousBaseline
              .subscriptions *
            (
              1 +
              audienceQuality +
              monetizationStrength
            ),

          volatility:
            volatility.subscriptions ||
            0,

          random,
        }),
        0
      )
    );

  const revenue =
    Math.round(
      clamp(
        applyVariation({
          value:
            previousBaseline
              .revenue *
            (
              1 +
              monetizationStrength
            ),

          volatility:
            volatility.revenue ||
            0,

          random,
        }),
        0
      )
    );

  return {
    streamedToday: true,

    hoursStreamed:
      Number(
        hoursStreamed.toFixed(2)
      ),

    averageConcurrentViewers,
    peakConcurrentViewers,
    uniqueViewers,
    followersGained,
    subscriptions,
    revenue,

    nextBaseline: {
      hoursStreamed:
        blendBaseline({
          previousBaseline:
            previousBaseline
              .hoursStreamed,

          finalValue:
            hoursStreamed,

          carryoverRate:
            carryover.audience ||
            0.025,
        }),

      averageConcurrentViewers:
        blendBaseline({
          previousBaseline:
            previousBaseline
              .averageConcurrentViewers,

          finalValue:
            averageConcurrentViewers,

          carryoverRate:
            carryover.audience ||
            0.025,
        }),

      uniqueViewers:
        blendBaseline({
          previousBaseline:
            previousBaseline
              .uniqueViewers,

          finalValue:
            uniqueViewers,

          carryoverRate:
            carryover.audience ||
            0.025,
        }),

      followersGained:
        blendBaseline({
          previousBaseline:
            previousBaseline
              .followersGained,

          finalValue:
            followersGained,

          carryoverRate:
            carryover.followers ||
            0.02,
        }),

      subscriptions:
        blendBaseline({
          previousBaseline:
            previousBaseline
              .subscriptions,

          finalValue:
            subscriptions,

          carryoverRate:
            carryover.subscriptions ||
            0.02,
        }),

      revenue:
        blendBaseline({
          previousBaseline:
            previousBaseline
              .revenue,

          finalValue:
            revenue,

          carryoverRate:
            carryover.revenue ||
            0.02,
        }),
    },
  };
}