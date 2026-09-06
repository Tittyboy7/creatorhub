import Link from "next/link";
import { getPlatform } from "@/lib/platforms";
import WorkspaceModeToggle from "@/components/workspace/WorkspaceModeToggle";

function getStatusStyles(status) {
  if (status === "healthy") {
    return {
      badge:
        "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
      dot:
        "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]",
      label: "Healthy",
    };
  }

  if (status === "attention") {
    return {
      badge:
        "border-amber-500/25 bg-amber-500/10 text-amber-300",
      dot:
        "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.75)]",
      label: "Needs Attention",
    };
  }

  return {
    badge:
      "border-zinc-700 bg-zinc-800 text-zinc-400",
    dot: "bg-zinc-500",
    label: "Unknown",
  };
}

function SyncIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
    >
      <path
        d="M20 7v5h-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M4 17v-5h5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M6.1 8.5A7 7 0 0 1 18.6 7L20 12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M17.9 15.5A7 7 0 0 1 5.4 17L4 12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PlatformDetailHeader({
  platform,
  showModeToggle = false,
}) {
  const platformConfig = getPlatform(platform.key);
  const PlatformIcon = platformConfig?.icon;

  const brandColor =
    platformConfig?.brandColor || "#71717a";

  const externalDashboard =
    platform.externalDashboard ||
    platformConfig?.externalDashboard;

  const statusStyles =
    getStatusStyles(platform.status);

  return (
    <header
      className="
        relative
        overflow-hidden
        rounded-[2rem]
        border
        border-zinc-800
        bg-zinc-900/70
        p-5
        shadow-[0_22px_65px_rgba(0,0,0,0.24)]
        backdrop-blur
        md:p-6
      "
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background: `radial-gradient(circle at top left, ${brandColor}24, transparent 42%)`,
        }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-y-5 left-0 w-[2px] rounded-full"
        style={{
          background: `linear-gradient(to bottom, ${brandColor}, ${brandColor}70, transparent)`,
        }}
      />

      <div className="relative">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div
              className="
                flex
                h-14
                w-14
                shrink-0
                items-center
                justify-center
                rounded-2xl
                border
                text-3xl
                shadow-[0_0_28px_rgba(0,0,0,0.18)]
                md:h-16
                md:w-16
              "
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

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Platform Workspace
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-3">
                <h1 className="truncate text-3xl font-bold tracking-tight text-white md:text-4xl">
                  {platform.name}
                </h1>

                <span
                  className={`
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    px-3
                    py-1.5
                    text-xs
                    font-semibold
                    ${statusStyles.badge}
                  `}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${statusStyles.dot}`}
                  />

                  {statusStyles.label}
                </span>
              </div>

              {platform.accountName ? (
                <p
                  className="mt-2 max-w-[320px] truncate text-sm font-medium text-zinc-400 sm:max-w-[480px]"
                  title={platform.accountName}
                >
                  {platform.accountName}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="
                inline-flex
                min-h-11
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-white
                px-4
                py-2.5
                text-sm
                font-semibold
                text-zinc-950
                transition
                hover:bg-zinc-200
              "
            >
              <SyncIcon />
              Sync Now
            </button>

            {externalDashboard?.href ? (
              <a
                href={externalDashboard.href}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  inline-flex
                  min-h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  border
                  border-zinc-700
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-zinc-300
                  transition
                  hover:bg-zinc-800
                  hover:text-white
                "
              >
                {externalDashboard.label ||
                  `Open ${platform.name} Dashboard`}
                <span aria-hidden="true">↗</span>
              </a>
            ) : null}

            <Link
              href="/platforms"
              className="
                inline-flex
                min-h-11
                items-center
                justify-center
                gap-2
                rounded-2xl
                border
                border-zinc-800
                px-4
                py-2.5
                text-sm
                font-semibold
                text-zinc-400
                transition
                hover:border-zinc-700
                hover:bg-zinc-800
                hover:text-white
              "
            >
              <span aria-hidden="true">←</span>
              Platform Hub
            </Link>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 border-t border-zinc-800/80 pt-5 xl:flex-row xl:items-end xl:justify-between">
          {showModeToggle ? (
            <WorkspaceModeToggle />
          ) : (
            <div />
          )}

          <div
            className="
              flex
              min-h-12
              items-center
              gap-3
              rounded-2xl
              border
              border-zinc-800
              bg-black/15
              px-4
              py-3
            "
          >
            <span
              aria-hidden="true"
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${statusStyles.dot}`}
            />

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">
                Last sync
              </p>

              <p className="mt-0.5 text-sm font-medium text-zinc-300">
                {platform.lastSynced || "Not available"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}