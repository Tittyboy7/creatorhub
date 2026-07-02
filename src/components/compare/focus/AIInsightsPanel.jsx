export default function AIInsightsPanel() {
  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5">
      <h3 className="text-lg font-bold text-white">
        AI Business Insights
      </h3>

      <p className="mt-2 text-sm text-zinc-500">
        CreatorsHub AI will automatically analyze this widget and surface
        meaningful trends.
      </p>

      <div className="mt-5 space-y-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
          <p className="text-sm text-zinc-400">
            📈 Revenue trends will appear here.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
          <p className="text-sm text-zinc-400">
            ⚠️ Anomalies and unusual changes.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
          <p className="text-sm text-zinc-400">
            💡 Optimization recommendations.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
          <p className="text-sm text-zinc-400">
            🎯 Forecasts and future projections.
          </p>
        </div>
      </div>
    </section>
  );
}