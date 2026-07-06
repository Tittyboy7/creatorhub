import { buildBusinessContext } from "../context/buildBusinessContext";
import { summarizeRevenueData } from "../context/summarizeRevenueData";
import { runAIProvider } from "../providers/runAIProvider";
import { buildWidgetSnapshotAnalysis } from "./buildWidgetSnapshotAnalysis";
import { buildRevenueInsights } from "./buildRevenueInsights";

export async function runWidgetSnapshotSkill({
  creator,
  widget,
  data,
  filters,
  timeframe,
  provider,
} = {}) {
  const context = buildBusinessContext({
    creator,
    widget,
    data,
    filters,
    timeframe,
    source: "widget-snapshot-skill",
  });

  const revenueSummary = summarizeRevenueData(context.data);

  const analysis = buildWidgetSnapshotAnalysis({
    revenueSummary,
  });

  const insights = buildRevenueInsights({
    context,
    revenueSummary,
  });

  return runAIProvider({
    provider,
    skillName: "widget-snapshot",
    context,
    analysis,
    insights,
  });
}