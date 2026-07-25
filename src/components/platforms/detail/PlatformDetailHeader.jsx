import Link from "next/link";
import { getPlatform } from "@/lib/platforms";
import WorkspaceModeToggle from "@/components/workspace/WorkspaceModeToggle";

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
  if (status === "attention") return "Needs Attention";
  return "Unknown";
}

export default function PlatformDetailHeader({
  platform,
  showModeToggle = false,
}) {
  const platformConfig = getPlatform(platform.key);
  const PlatformIcon = platformConfig?.icon;
  const brandColor = platformConfig?.brandColor || "#71717a";
  const externalDashboard =
    platform.externalDashboard || platformConfig?.externalDashboard;

  return (
    <section className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-4">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border text-4xl"
          style={{
            color: brandColor,
            borderColor: `${brandColor}4D`,
            backgroundColor: `${brandColor}1A`,
          }}
        >
          {PlatformIcon ? (
            <PlatformIcon aria-hidden="true" />
          ) : (
            <span className="text-2xl font-bold">
              {platform.name?.charAt(0) || "P"}
            </span>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Platform Intelligence
          </p>

          <h1 className="mt-1 text-4xl font-bold text-white">
            {platform.name}
          </h1>

          {platform.accountName && (
            <p
              className="mt-1 max-w-[260px] truncate text-sm font-medium text-zinc-400 sm:max-w-[380px]"
              title={platform.accountName}
            >
              {platform.accountName}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyles(
                platform.status
              )}`}
            >
              {getStatusLabel(platform.status)}
            </span>

            <span className="text-sm text-zinc-500">
              Synced {platform.lastSynced}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
  {showModeToggle && (
    <WorkspaceModeToggle className="mr-1" />
  )}

  <button className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200">
    Sync Now
  </button>

  {platform.externalDashboard?.href && (
    <a
      href={platform.externalDashboard.href}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-2xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
    >
      {platform.externalDashboard.label ||
        `Open ${platform.name} Dashboard`}{" "}
      ↗
    </a>
  )}

  <Link
    href="/platforms"
    className="rounded-2xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
  >
    Back to Platform Hub
  </Link>
</div>
    </section>
  );
}