import { businessSystems } from "@/lib/business/businessSystems";
import { businessTimePeriods } from "@/lib/business/businessTimePeriods";

export default function ComparisonSidebar({
  platforms = [],
  metricTypes = [],
  selectedSystem,
  setSelectedSystem,
  selectedTimePeriod,
  setSelectedTimePeriod,
}) {
  return (
    <aside className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
      <h2 className="text-xl font-bold">Comparison Controls</h2>

      <p className="mt-2 text-sm text-zinc-500">
        Filter the business systems, platforms, and time range you want to compare.
      </p>

      <div className="mt-5 space-y-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-sm font-semibold text-white">Platforms</p>
          <p className="mt-1 text-sm text-zinc-500">
            {platforms.length > 0 ? platforms.join(", ") : "No platform data yet."}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-sm font-semibold text-white">Business System</p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedSystem("all")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                selectedSystem === "all"
                  ? "bg-white text-black"
                  : "border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              All
            </button>

            {businessSystems.map((system) => (
              <button
                key={system.key}
                type="button"
                onClick={() => setSelectedSystem(system.key)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  selectedSystem === system.key
                    ? "bg-white text-black"
                    : "border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                {system.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-sm font-semibold text-white">Metrics</p>
          <p className="mt-1 text-sm text-zinc-500">
            {metricTypes.length > 0
              ? metricTypes.join(", ")
              : "No metrics available yet."}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-sm font-semibold text-white">Time Range</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {businessTimePeriods.map((period) => (
              <button
                key={period.key}
                type="button"
                onClick={() => setSelectedTimePeriod(period.key)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  selectedTimePeriod === period.key
                    ? "bg-white text-black"
                    : "border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}