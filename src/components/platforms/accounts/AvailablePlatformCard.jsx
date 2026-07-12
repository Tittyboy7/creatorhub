import Link from "next/link";
import PlatformStatusBadge from "./PlatformStatusBadge";

export default function AvailablePlatformCard({ platform }) {
  const PlatformIcon = platform.icon;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-lg"
            style={{
              color: platform.brandColor || "#a1a1aa",
              borderColor: platform.brandColor
                ? `${platform.brandColor}4D`
                : "#3f3f46",
              backgroundColor: platform.brandColor
                ? `${platform.brandColor}1A`
                : "#18181b",
            }}
          >
            {PlatformIcon ? (
              <PlatformIcon aria-hidden="true" />
            ) : (
              <span className="text-sm font-bold">
                {platform.name.charAt(0)}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <h3 className="font-bold text-white">{platform.name}</h3>

            <p className="mt-1 line-clamp-2 text-sm leading-5 text-zinc-500">
              {platform.description}
            </p>
          </div>
        </div>

        <PlatformStatusBadge account={null} platform={platform} />
      </div>

      <div className="mt-4">
        {platform.available ? (
          <Link
            href={`/connected-accounts/${platform.key}`}
            className="inline-flex rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
          >
            Connect {platform.name}
          </Link>
        ) : (
          <span className="inline-flex rounded-xl border border-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-600">
            Coming Soon
          </span>
        )}
      </div>
    </div>
  );
}