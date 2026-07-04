import { buildBusinessContext } from "../context/buildBusinessContext";
import { summarizeRevenueData } from "../context/summarizeRevenueData";
import { runAIProvider } from "../providers/runAIProvider";
import { buildRevenueAnalysis } from "./buildRevenueAnalysis";
import { buildRevenueInsights } from "./buildRevenueInsights";

export async function runRevenueAnalysisSkill({
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
    source: "revenue-analysis-skill",
  });

  const revenueSummary = summarizeRevenueData(context.data);

  const analysis = buildRevenueAnalysis({
    revenueSummary,
  });

  const insights = buildRevenueInsights({
    context,
    revenueSummary,
  });

  return runAIProvider({
    provider,
    skillName: "revenue-analysis",
    context,
    analysis,
    insights,
  });
}