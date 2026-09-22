import Link from "next/link";

const STARTER_PLATFORMS = [
  {
    name: "YouTube",
    key: "youtube",
    description:
      "Bring in channel performance, audience growth, content, and revenue.",
    icon: (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        className="h-5 w-5"
      >
        <path
          d="M10 8.5 15 12l-5 3.5v-7Z"
          fill="currentColor"
        />

        <rect
          x="3.5"
          y="6"
          width="17"
          height="12"
          rx="4"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    ),
    iconClass:
      "border-red-500/30 bg-red-500/10 text-red-300",
    buttonClass:
      "border-red-500/30 text-red-300 hover:bg-red-500/10",
  },

  {
    name: "Twitch",
    key: "twitch",
    description:
      "Track streams, viewers, followers, subscriptions, and streaming revenue.",
    icon: (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        className="h-5 w-5"
      >
        <path
          d="M5 4h14v10l-4 4h-4l-2 2v-2H5V4Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />

        <path
          d="M10 8v4M14 8v4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
    iconClass:
      "border-violet-500/30 bg-violet-500/10 text-violet-300",
    buttonClass:
      "border-violet-500/30 text-violet-300 hover:bg-violet-500/10",
  },

  {
    name: "Shopify",
    key: "shopify",
    description:
      "Connect store sales, orders, products, conversion, and commerce performance.",
    icon: (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        className="h-5 w-5"
      >
        <path
          d="M7 8.5h10l1 11H6l1-11Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />

        <path
          d="M9 9V7a3 3 0 0 1 6 0v2"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
    iconClass:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    buttonClass:
      "border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10",
  },
];

function StarterPlatformCard({
  platform,
}) {
  return (
    <article
      className="
        flex
        min-w-0
        flex-col
        rounded-2xl
        border
        border-zinc-800
        bg-zinc-950/60
        p-5
        transition
        hover:-translate-y-0.5
        hover:border-zinc-700
        hover:bg-zinc-950
      "
    >
      <div
        className={`
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-2xl
          border
          ${platform.iconClass}
        `}
      >
        {platform.icon}
      </div>

      <h3 className="mt-4 text-base font-bold text-white">
        {platform.name}
      </h3>

      <p className="mt-2 flex-1 text-sm leading-6 text-zinc-500">
        {platform.description}
      </p>

      <Link
        href={`/connected-accounts/${platform.key}`}
        className={`
          mt-5
          inline-flex
          min-h-10
          items-center
          justify-center
          rounded-xl
          border
          px-4
          py-2
          text-sm
          font-semibold
          transition
          ${platform.buttonClass}
        `}
      >
        Connect {platform.name}
      </Link>
    </article>
  );
}

export default function PlatformEmptyState() {
  return (
    <section
      className="
        overflow-hidden
        rounded-3xl
        border
        border-zinc-800
        bg-zinc-900/70
        backdrop-blur
      "
    >
      <div className="px-5 py-8 text-center sm:px-8 sm:py-10">
        <div
          className="
            mx-auto
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            border
            border-rose-500/25
            bg-rose-500/10
            text-rose-300
            shadow-[0_0_35px_rgba(244,63,94,0.08)]
          "
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            className="h-6 w-6"
          >
            <path
              d="M8.5 15.5l7-7"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />

            <path
              d="M7 10.5 4.8 12.7a4 4 0 0 0 5.7 5.7l2.2-2.2"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d="m17 13.5 2.2-2.2a4 4 0 1 0-5.7-5.7l-2.2 2.2"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-rose-400">
          Get started
        </p>

        <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Connect your first platform
        </h2>

        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
          Bring your creator business into one place. Connect a
          platform to start seeing performance, revenue, trends, and
          the signals that matter across your business.
        </p>
      </div>

      <div className="border-t border-zinc-800 bg-black/10 p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-3">
          {STARTER_PLATFORMS.map(
            (platform) => (
              <StarterPlatformCard
                key={platform.key}
                platform={platform}
              />
            )
          )}
        </div>

        <div className="mt-4 flex justify-center">
          <Link
            href="/connected-accounts"
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 transition hover:text-white"
          >
            View all available connections
            <span aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}