export default function AiInsightsSection({ insights }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="mb-4">
        <p className="text-sm font-semibold text-zinc-300">AI Insights</p>
        <p className="mt-1 text-xs text-zinc-500">
          Rule-based insights now, AI-generated recommendations later.
        </p>
      </div>

      <div className="space-y-3">
        {insights.map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-3"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {item.title}
            </p>

            <p className="mt-2 text-sm text-zinc-300">{item.insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
}