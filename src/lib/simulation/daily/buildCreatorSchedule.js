import createSeededRandom from "../engine/createSeededRandom";

const WEEKDAY_INDEXES = [
  0, 1, 2, 3, 4, 5, 6,
];

function clampCount(value) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      7,
      Math.round(value)
    )
  );
}

function shuffleValues(
  values,
  random
) {
  const shuffled = [...values];

  for (
    let index =
      shuffled.length - 1;
    index > 0;
    index -= 1
  ) {
    const targetIndex =
      Math.floor(
        random() * (index + 1)
      );

    [
      shuffled[index],
      shuffled[targetIndex],
    ] = [
      shuffled[targetIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

function chooseSpreadDays({
  count,
  random,
}) {
  const safeCount =
    clampCount(count);

  if (!safeCount) {
    return [];
  }

  if (safeCount === 7) {
    return [...WEEKDAY_INDEXES];
  }

  const offset =
    Math.floor(random() * 7);

  const candidates = [];

  for (
    let index = 0;
    index < safeCount;
    index += 1
  ) {
    const position =
      Math.floor(
        (index * 7) /
          safeCount
      );

    candidates.push(
      (position + offset) % 7
    );
  }

  return [
    ...new Set(candidates),
  ].sort(
    (first, second) =>
      first - second
  );
}

function chooseStreamDays({
  count,
  uploadDays,
  random,
}) {
  const safeCount =
    clampCount(count);

  if (!safeCount) {
    return [];
  }

  const shuffledDays =
    shuffleValues(
      WEEKDAY_INDEXES,
      random
    );

  const nonUploadDays =
    shuffledDays.filter(
      (day) =>
        !uploadDays.includes(day)
    );

  const overlappingDays =
    shuffledDays.filter(
      (day) =>
        uploadDays.includes(day)
    );

  return [
    ...nonUploadDays,
    ...overlappingDays,
  ]
    .slice(0, safeCount)
    .sort(
      (first, second) =>
        first - second
    );
}

function buildWeeklyPattern({
  uploadDays,
  streamDays,
}) {
  return WEEKDAY_INDEXES.map(
    (dayOfSimulationWeek) => ({
      dayOfSimulationWeek:
        dayOfSimulationWeek + 1,

      scheduledUpload:
        uploadDays.includes(
          dayOfSimulationWeek
        ),

      scheduledStream:
        streamDays.includes(
          dayOfSimulationWeek
        ),
    })
  );
}

export default function buildCreatorSchedule({
  creator,
  calendar,
  dailyProfile,
}) {
  const days =
    calendar?.days || [];

  if (
    !creator ||
    !days.length ||
    !dailyProfile
  ) {
    return null;
  }

  const creatorSeed =
    dailyProfile.seed || 1;

  const random =
    createSeededRandom(
      creatorSeed + 7301
    );

  const uploadsPerWeek =
    clampCount(
      dailyProfile.schedule
        ?.uploadsPerWeek
    );

  const streamsPerWeek =
    clampCount(
      dailyProfile.schedule
        ?.streamsPerWeek
    );

  const uploadDays =
    chooseSpreadDays({
      count: uploadsPerWeek,
      random,
    });

  const streamDays =
    chooseStreamDays({
      count: streamsPerWeek,
      uploadDays,
      random,
    });

  const weeklyPattern =
    buildWeeklyPattern({
      uploadDays,
      streamDays,
    });

  const scheduledDays =
    days.map((day) => {
      const pattern =
        weeklyPattern[
          day.dayOfSimulationWeek - 1
        ];

      return {
        ...day,

        scheduledUpload:
          pattern?.scheduledUpload ||
          false,

        scheduledStream:
          pattern?.scheduledStream ||
          false,
      };
    });

  return {
    source:
      "deterministic-creator-schedule",

    creatorId:
      creator.id,

    uploadsPerWeek,
    streamsPerWeek,

    weeklyPattern,

    days: scheduledDays,
  };
}