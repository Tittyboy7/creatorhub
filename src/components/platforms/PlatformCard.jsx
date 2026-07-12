import Link from "next/link";

function getStatusStyles(status) {
  if (status === "healthy") {
    return "bg-green-950 text-green-400 border-green-900";
  }

  if (status === "attention") {
    return "bg-yellow-950 text-yellow-400 border-yellow-900";
  }

  return "bg-zinc-800 text-zinc-400 border-zinc-700";
}

function getStatusLabel(status) {
  if (status === "healthy") return "Healthy";
  if (status === "attention") return "Warning";
  return "Unknown";
}

function getTrendClass(trend) {
  if (!trend) return "text-zinc-500";
  if (trend.startsWith("-")) return "text-red-400";
  return "text-green-400";
}

function MetricTile({ stat }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
      <p className="text-xs text-zinc-500">{stat.label}</p>

      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="text-lg font-bold text-white">{stat.value}</p>

        {stat.trend && (
          <p className={`text-xs font-semibold ${getTrendClass(stat.trend)}`}>
            {stat.trend}
          </p>
        )}
      </div>
    </div>
  );
}

export default function PlatformCard({ platform }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-white">{platform.name}</h2>

            {platform.type && (
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] font-semibold text-zinc-400">
                {platform.type}
              </span>
            )}
          </div>

          <p className="mt-1 text-xs text-zinc-500">
            Synced {platform.lastSynced}
          </p>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyles(
            platform.status
          )}`}
        >
          {getStatusLabel(platform.status)}
        </span>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Today
        </p>

        <div className="grid grid-cols-2 gap-2">
          {platform.todayStats.slice(0, 4).map((stat) => (
            <MetricTile key={stat.label} stat={stat} />
          ))}
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Lifetime
        </p>

        <div className="space-y-2">
          {platform.overallStats.slice(0, 4).map((stat) => (
            <div
              key={stat.label}
              className="flex items-center justify-between border-b border-zinc-800 pb-2 text-sm last:border-b-0 last:pb-0"
            >
              <p className="text-zinc-400">{stat.label}</p>
              <p className="font-semibold text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link
          href={`/platforms/${platform.key}`}
          className="rounded-xl border border-zinc-700 px-4 py-3 text-center text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
        >
          View Details
        </Link>

        <button className="rounded-xl border border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white">
          Sync Now
        </button>
      </div>
    </div>
  );
}