import buildSimulationCalendar from "../time/buildSimulationCalendar";
import buildDailySimulationProfile from "./buildDailySimulationProfile";
import buildCreatorSchedule from "./buildCreatorSchedule";
import simulateDailyHistory from "./simulateDailyHistory";
import buildBusinessIntelligence from "../context/buildBusinessIntelligence";
import buildBusinessBrief from "../intelligence/buildBusinessBrief";

export default function buildDailySimulationSnapshot(
  creator,
  {
    totalDays = 365,
    currentPeriodDays = 28,
    endDate,
  } = {}
) {
  if (!creator) {
    return null;
  }

  const calendar =
    buildSimulationCalendar({
      totalDays,
      ...(endDate
        ? { endDate }
        : {}),
    });

  if (
    !calendar ||
    !calendar.days?.length
  ) {
    return null;
  }

  const dailyProfile =
    buildDailySimulationProfile(
      creator
    );

  if (!dailyProfile) {
    return null;
  }

  const schedule =
    buildCreatorSchedule({
      creator,
      calendar,
      dailyProfile,
    });

  if (
    !schedule ||
    !schedule.days?.length
  ) {
    return null;
  }

  const history =
    simulateDailyHistory({
      creator,
      dailyProfile,
      schedule,
      currentPeriodDays,
    });

  if (!history) {
    return null;
  }

  const context =
    buildBusinessIntelligence({
      creator,
      history,
    });

  if (!context) {
    return null;
  }

  const brief =
    buildBusinessBrief(
      context
    );

  return {
    source:
      "daily-simulation",

    creator: {
      id: creator.id,

      name:
        creator.profile?.name,

      username:
        creator.profile?.username,

      creatorType:
        creator.profile
          ?.creatorType,

      primaryPlatform:
        creator.business
          ?.primaryPlatform,

      seed:
        creator.simulation?.seed,
    },

    reporting: {
      totalDays,

      currentPeriodDays,

      startDate:
        history.startDate,

      endDate:
        history.endDate,

      currentPeriod: {
        startDate:
          history.currentPeriod
            ?.startDate,

        endDate:
          history.currentPeriod
            ?.endDate,
      },

      previousPeriod: {
        startDate:
          history.previousPeriod
            ?.startDate,

        endDate:
          history.previousPeriod
            ?.endDate,
      },
    },

    calendar,

    dailyProfile,

    schedule,

    today:
      history.today,

    days:
      history.days,

    currentPeriod:
      history.currentPeriod,

    previousPeriod:
      history.previousPeriod,

    changes:
      history.changes,

    context,

    brief,  

    periods:
      history.periods,

    weeklyHistory:
      history.weeklyHistory,

    monthlyHistory:
      history.monthlyHistory,

    finalState:
      history.finalState,

    history,
  };
}