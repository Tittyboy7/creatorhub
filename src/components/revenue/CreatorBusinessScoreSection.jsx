import InfoTooltip from "./InfoTooltip";

function getScoreColor(score) {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-yellow-400";
  return "text-red-400";
}

function ScoreFactor({ label, status, description }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold">{label}</p>
        <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
          {status}
        </span>
      </div>

      <p className="mt-2 text-sm text-zinc-500">{description}</p>
    </div>
  );
}

export default function CreatorBusinessScoreSection({
  monthlyGrowthPercent,
  platformCount,
  topPlatformPercent,
  totalRevenue,
}) {
  let score = 50;

  if (totalRevenue > 0) score += 10;
  if (monthlyGrowthPercent > 0) score += 15;
  if (platformCount >= 3) score += 15;
  if (topPlatformPercent < 60) score += 10;

  score = Math.min(score, 100);

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
      <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 text-center">
          <p className={`text-6xl font-black ${getScoreColor(score)}`}>
            {score}
          </p>

          <p className="mt-2 text-sm text-zinc-500">out of 100</p>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-white"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <ScoreFactor
            label="Revenue Tracking"
            status={totalRevenue > 0 ? "Active" : "Needs data"}
            description="Checks whether your dashboard has tracked revenue to analyze."
          />

          <ScoreFactor
            label="Growth Trend"
            status={monthlyGrowthPercent > 0 ? "Positive" : "Needs attention"}
            description="Looks at whether tracked revenue is trending upward."
          />

          <ScoreFactor
            label="Platform Diversity"
            status={platformCount >= 3 ? "Healthy" : "Limited"}
            description="Rewards having multiple revenue platforms connected."
          />

          <ScoreFactor
            label="Revenue Balance"
            status={topPlatformPercent < 60 ? "Balanced" : "Concentrated"}
            description="Checks whether one platform is carrying too much of your revenue."
          />
        </div>
      </div>
    </section>
  );
}