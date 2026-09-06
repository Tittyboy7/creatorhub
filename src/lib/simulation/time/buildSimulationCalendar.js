const DAY_IN_MILLISECONDS =
  24 * 60 * 60 * 1000;

export const DEFAULT_SIMULATION_END_DATE =
  "2026-07-31";

function parseSimulationDate(dateString) {
  if (!dateString) {
    return null;
  }

  const date =
    new Date(`${dateString}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime())
  ) {
    return null;
  }

  return date;
}

function formatDateKey(date) {
  return date
    .toISOString()
    .slice(0, 10);
}

function buildDayRecord({
  date,
  dayIndex,
  totalDays,
}) {
  const dayOfWeek =
    date.getUTCDay();

  return {
    dayIndex,

    date:
      formatDateKey(date),

    dayOfWeek,

    dayName:
      [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ][dayOfWeek],

    isWeekend:
      dayOfWeek === 0 ||
      dayOfWeek === 6,

    weekIndex:
      Math.floor(
        (dayIndex - 1) / 7
      ) + 1,

    dayOfSimulationWeek:
      ((dayIndex - 1) % 7) + 1,

    isFirstDay:
      dayIndex === 1,

    isLastDay:
      dayIndex === totalDays,
  };
}

export default function buildSimulationCalendar({
  totalDays = 365,
  endDate =
    DEFAULT_SIMULATION_END_DATE,
} = {}) {
  if (
    !Number.isInteger(totalDays) ||
    totalDays < 1
  ) {
    return [];
  }

  const parsedEndDate =
    parseSimulationDate(endDate);

  if (!parsedEndDate) {
    return [];
  }

  const startDate =
    new Date(
      parsedEndDate.getTime() -
        (totalDays - 1) *
          DAY_IN_MILLISECONDS
    );

  const days = [];

  for (
    let index = 0;
    index < totalDays;
    index += 1
  ) {
    const date =
      new Date(
        startDate.getTime() +
          index *
            DAY_IN_MILLISECONDS
      );

    days.push(
      buildDayRecord({
        date,
        dayIndex: index + 1,
        totalDays,
      })
    );
  }

  return {
    source: "fixed-simulation-calendar",

    totalDays,

    startDate:
      formatDateKey(startDate),

    endDate:
      formatDateKey(
        parsedEndDate
      ),

    days,
  };
}