import gamingStreamer from "./creators/gamingStreamer";

import simulateHistory from "./engine/simulateHistory";

export default function testSimulation() {
  const history = simulateHistory(gamingStreamer);

  console.group("CreatorsHub Simulation");

  console.table(history.weeks);

  console.log("Previous Period");
  console.table(history.previousPeriod);

  console.log("Current Period");
  console.table(history.currentPeriod);

  console.log("Business Signals");
  console.table(history.changes);

  console.groupEnd();

  return history;
}