import buildPlatformHealth from "@/lib/simulation/hub/buildPlatformHealth";

const PLATFORM_KEYS = [
  "youtube",
  "twitch",
  "shopify",
];

function round(
  value,
  decimals = 1
) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return value;
  }

  const multiplier =
    10 ** decimals;

  return (
    Math.round(
      value * multiplier
    ) / multiplier
  );
}

function roundSignals(
  signals
) {
  if (!signals) {
    return null;
  }

  return Object.fromEntries(
    Object.entries(
      signals
    ).map(
      ([key, value]) => [
        key,
        round(value),
      ]
    )
  );
}

function buildPlatformDiagnostic({
  platformKey,
  dailySimulation,
}) {
  const days =
    dailySimulation?.days || [];

  const periodDays =
    dailySimulation?.reporting
      ?.currentPeriodDays || 28;

  const firstValidEndIndex =
    periodDays * 2 - 1;

  const checkpoints = [];

  for (
    let endIndex =
      firstValidEndIndex;
    endIndex < days.length;
    endIndex += periodDays
  ) {
    const health =
      buildPlatformHealth({
        platformKey,
        dailySimulation,
        endIndex,
      });

    checkpoints.push({
      endDate:
        days[endIndex]?.date ||
        null,

      status:
        health.status,

      reason:
        health.attentionReason,

      signals:
        roundSignals(
          health.signals
        ),
    });
  }

  const finalEndIndex =
    days.length - 1;

  const lastCheckpoint =
    checkpoints[
      checkpoints.length - 1
    ];

  if (
    finalEndIndex >=
      firstValidEndIndex &&
    lastCheckpoint?.endDate !==
      days[finalEndIndex]?.date
  ) {
    const health =
      buildPlatformHealth({
        platformKey,
        dailySimulation,
        endIndex:
          finalEndIndex,
      });

    checkpoints.push({
      endDate:
        days[
          finalEndIndex
        ]?.date || null,

      status:
        health.status,

      reason:
        health.attentionReason,

      signals:
        roundSignals(
          health.signals
        ),
    });
  }

  const healthyPeriods =
    checkpoints.filter(
      (checkpoint) =>
        checkpoint.status ===
        "healthy"
    );

  const attentionPeriods =
    checkpoints.filter(
      (checkpoint) =>
        checkpoint.status ===
        "attention"
    );

  const unknownPeriods =
    checkpoints.filter(
      (checkpoint) =>
        checkpoint.status ===
        "unknown"
    );

  return {
    totalCheckpoints:
      checkpoints.length,

    healthyCount:
      healthyPeriods.length,

    attentionCount:
      attentionPeriods.length,

    unknownCount:
      unknownPeriods.length,

    attentionPeriods,

    checkpoints,
  };
}

export default function buildPlatformHealthDiagnostic(
  dailySimulation
) {
  if (
    !dailySimulation?.days
      ?.length
  ) {
    return null;
  }

  return {
    totalCalendarDays:
      dailySimulation.days.length,

    reportingPeriodDays:
      dailySimulation
        ?.reporting
        ?.currentPeriodDays ||
      28,

    platforms:
      Object.fromEntries(
        PLATFORM_KEYS.map(
          (platformKey) => [
            platformKey,

            buildPlatformDiagnostic({
              platformKey,
              dailySimulation,
            }),
          ]
        )
      ),
  };
}