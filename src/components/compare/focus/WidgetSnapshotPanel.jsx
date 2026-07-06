"use client";

import { useEffect, useState } from "react";
import AIInsightCard from "@/components/ui/AIInsightCard";

import {
  getAIDebugInfo,
  getAIProviderLabel,
  runWidgetSnapshotSkill,
} from "@/lib/ai";

export default function AIInsightsPanel({
  creator = null,
  widget = null,
  data,
  filters,
  timeframe = null,
}) {
  const safeData = Array.isArray(data) ? data : [];
  const safeFilters = filters || {};

  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [insights, setInsights] = useState([]);
  const [provider, setProvider] = useState("mock");
  const [expanded, setExpanded] = useState(false);

  const debugInfo = getAIDebugInfo();

  useEffect(() => {
    let isMounted = true;

    async function loadSnapshot() {
      setLoading(true);

      try {
        const result = await runWidgetSnapshotSkill({
          creator,
          widget,
          data: safeData,
          filters: safeFilters,
          timeframe,
        });

        if (isMounted) {
          setAnalysis(result?.analysis || null);
          setInsights(
            (result?.insights || []).filter((insight) => insight.priority !== "low")
          );
          setProvider(result?.provider || "mock");
        }
      } catch (error) {
        console.error("Failed to load widget snapshot:", error);

        if (isMounted) {
          setAnalysis({
            summary:
              "CreatorsHub could not generate a snapshot for this widget right now.",
            confidence: "low",
          });
          setInsights([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadSnapshot();

    return () => {
      isMounted = false;
    };
  }, [creator, widget, timeframe]);

  const keyObservation = insights.find(
    (insight) =>
      insight.category === "anomaly" ||
      insight.category === "performance" ||
      insight.category === "revenue"
  );

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-violet-300">
            Widget Snapshot
          </p>

          <h3 className="mt-1 text-lg font-bold text-white">
            What this chart means
          </h3>
        </div>

        <div className="shrink-0 text-right">
          <span className="inline-flex rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-300">
            {getAIProviderLabel(provider)}
          </span>

          {process.env.NODE_ENV === "development" ? (
            <p className="mt-1 text-[10px] text-zinc-600">
              {debugInfo.mode} mode
            </p>
          ) : null}
        </div>
      </div>

      {loading ? (
        <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
          <p className="text-sm text-zinc-400">Reading this widget...</p>
        </div>
      ) : (
        <>
          <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
              What happened?
            </p>

            <p className="mt-2 text-sm leading-6 text-zinc-300">
              {analysis?.summary ||
                "This widget does not have enough data yet to explain a clear pattern."}
            </p>
          </div>

          <div className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
              Why it matters
            </p>

            <p className="mt-2 text-sm leading-6 text-zinc-300">
              {keyObservation?.summary ||
                analysis?.biggestRisk?.summary ||
                "Once more data is available, CreatorsHub will explain why this chart matters."}
            </p>
          </div>

          <div className="mt-3 rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-violet-300">
              Next best step
            </p>

            <p className="mt-2 text-sm leading-6 text-zinc-300">
              {analysis?.recommendedActions?.[0] ||
                "Compare this widget against another platform, time period, or revenue stream."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="mt-4 text-sm font-semibold text-zinc-400 hover:text-white"
          >
            {expanded ? "Hide supporting insights ↑" : "Show supporting insights ↓"}
          </button>

          {expanded ? (
            <div className="mt-3 space-y-3">
              {insights.map((insight, index) => (
                <AIInsightCard
                  key={`${insight.title}-${index}`}
                  insight={insight}
                />
              ))}
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}