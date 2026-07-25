import simulateHistory from "./engine/simulateHistory";
import buildBusinessIntelligence from "./context/buildBusinessIntelligence";
import buildBusinessBrief from "./intelligence/buildBusinessBrief";

export default function buildSimulationSnapshot(
  creator,
  {
    totalWeeks = 8,
    currentPeriodWeeks = 4,
  } = {}
) {
  if (!creator) {
    return null;
  }

  const history = simulateHistory(creator, {
    totalWeeks,
    currentPeriodWeeks,
  });

  if (!history) {
    return null;
  }

  const context = buildBusinessIntelligence({
    creator,
    history,
  });

  if (!context) {
    return null;
  }

  const brief = buildBusinessBrief(context);

  return {
    source: "simulation",

    creator: {
      id: creator.id,
      name: creator.profile?.name,
      username: creator.profile?.username,
      creatorType:
        creator.profile?.creatorType,
      primaryPlatform:
        creator.business?.primaryPlatform,
      seed: creator.simulation?.seed,
    },

    reporting: {
      totalWeeks,
      currentPeriodWeeks,
    },

    weeks: history.weeks,

    currentPeriod: history.currentPeriod,
    previousPeriod: history.previousPeriod,
    changes: history.changes,

    context,
    brief,

    history,
  };
}