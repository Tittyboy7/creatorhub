const DAYS_PER_WEEK = 7;

export function weeklyGrowthRateToDaily(
  weeklyRate = 0
) {
  if (
    typeof weeklyRate !== "number" ||
    !Number.isFinite(weeklyRate)
  ) {
    return 0;
  }

  if (weeklyRate <= -1) {
    return -1;
  }

  return (
    Math.pow(
      1 + weeklyRate,
      1 / DAYS_PER_WEEK
    ) - 1
  );
}

export function weeklyProbabilityToDaily(
  weeklyProbability = 0
) {
  if (
    typeof weeklyProbability !== "number" ||
    !Number.isFinite(weeklyProbability)
  ) {
    return 0;
  }

  const safeProbability =
    Math.min(
      1,
      Math.max(
        0,
        weeklyProbability
      )
    );

  return (
    1 -
    Math.pow(
      1 - safeProbability,
      1 / DAYS_PER_WEEK
    )
  );
}

export function weeklyValueToDaily(
  weeklyValue = 0
) {
  if (
    typeof weeklyValue !== "number" ||
    !Number.isFinite(weeklyValue)
  ) {
    return 0;
  }

  return weeklyValue / DAYS_PER_WEEK;
}

export function dailyValueToWeekly(
  dailyValue = 0
) {
  if (
    typeof dailyValue !== "number" ||
    !Number.isFinite(dailyValue)
  ) {
    return 0;
  }

  return dailyValue * DAYS_PER_WEEK;
}

export function dailyGrowthRateToWeekly(
  dailyRate = 0
) {
  if (
    typeof dailyRate !== "number" ||
    !Number.isFinite(dailyRate)
  ) {
    return 0;
  }

  if (dailyRate <= -1) {
    return -1;
  }

  return (
    Math.pow(
      1 + dailyRate,
      DAYS_PER_WEEK
    ) - 1
  );
}

export function dailyProbabilityToWeekly(
  dailyProbability = 0
) {
  if (
    typeof dailyProbability !== "number" ||
    !Number.isFinite(
      dailyProbability
    )
  ) {
    return 0;
  }

  const safeProbability =
    Math.min(
      1,
      Math.max(
        0,
        dailyProbability
      )
    );

  return (
    1 -
    Math.pow(
      1 - safeProbability,
      DAYS_PER_WEEK
    )
  );
}

export {
  DAYS_PER_WEEK,
};