import { runWidgetSnapshotSkill } from "./widgetSnapshotSkill";

export async function runRevenueAnalysisSkill(options = {}) {
  return runWidgetSnapshotSkill({
    ...options,
  });
}