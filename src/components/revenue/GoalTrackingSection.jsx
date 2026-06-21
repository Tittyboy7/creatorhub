export default function GoalTrackingSection({ goalCards }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="mb-4">
        <p className="text-sm font-semibold text-zinc-300">Goal Tracking</p>
        <p className="mt-1 text-xs text-zinc-500">
          API-ready goals for revenue, audience, products, and stream activity.
        </p>
      </div>

      <div className="space-y-4">
        {goalCards.map((goal) => {
          const percent =
            goal.goal === 0
              ? 0
              : Math.min(Math.round((goal.current / goal.goal) * 100), 100);

          return (
            <div key={goal.label}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">{goal.label}</p>
                <p className="text-xs text-zinc-500">{goal.display}</p>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-white"
                  style={{ width: `${percent}%` }}
                />
              </div>

              <p className="mt-1 text-xs text-zinc-500">{percent}% complete</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}