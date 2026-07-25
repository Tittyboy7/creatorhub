import Link from "next/link";

const CONNECTION_VISUALS = {
  patreon: {
    icon: "P",
    iconClass:
      "border-orange-500/30 bg-orange-500/10 text-orange-300",
    buttonClass:
      "border-orange-500/30 text-orange-300 hover:bg-orange-500/10",
  },

  stripe: {
    icon: "S",
    iconClass:
      "border-indigo-500/30 bg-indigo-500/10 text-indigo-300",
    buttonClass:
      "border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10",
  },

  paypal: {
    icon: "P",
    iconClass:
      "border-blue-500/30 bg-blue-500/10 text-blue-300",
    buttonClass:
      "border-blue-500/30 text-blue-300 hover:bg-blue-500/10",
  },

  kick: {
    icon: "K",
    iconClass:
      "border-green-500/30 bg-green-500/10 text-green-300",
    buttonClass:
      "border-green-500/30 text-green-300 hover:bg-green-500/10",
  },

  streamlabs: {
    icon: "S",
    iconClass:
      "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
    buttonClass:
      "border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10",
  },

  streamelements: {
    icon: "S",
    iconClass:
      "border-violet-500/30 bg-violet-500/10 text-violet-300",
    buttonClass:
      "border-violet-500/30 text-violet-300 hover:bg-violet-500/10",
  },
};

const DEFAULT_VISUAL = {
  icon: "+",
  iconClass:
    "border-zinc-700 bg-zinc-800 text-zinc-300",
  buttonClass:
    "border-zinc-700 text-zinc-300 hover:bg-zinc-800",
};

function ConnectionCard({ platform }) {
  const visual =
    CONNECTION_VISUALS[platform.key] ||
    DEFAULT_VISUAL;

  return (
    <article
      className="
        group
        flex
        min-w-0
        flex-col
        justify-between
        gap-4
        rounded-2xl
        border
        border-zinc-800
        bg-black/15
        p-4
        transition
        hover:-translate-y-0.5
        hover:border-zinc-700
        hover:bg-zinc-900
      "
    >
      <div className="flex min-w-0 items-start gap-3">
        <div
          className={`
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            text-sm
            font-black
            ${visual.iconClass}
          `}
        >
          {visual.icon}
        </div>

        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-white">
            {platform.name}
          </h3>

          <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500">
            {platform.description}
          </p>
        </div>
      </div>

      <Link
        href={`/connected-accounts/${platform.key}`}
        className={`
          inline-flex
          items-center
          justify-center
          rounded-xl
          border
          px-3
          py-2
          text-xs
          font-semibold
          transition
          ${visual.buttonClass}
        `}
      >
        Connect
      </Link>
    </article>
  );
}

export default function RecommendedConnections({
  recommendations,
}) {
  if (
    !recommendations ||
    recommendations.length === 0
  ) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5 backdrop-blur">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Expand your workspace
          </p>

          <h2 className="mt-1 text-lg font-bold text-white">
            Recommended Connections
          </h2>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500">
            Add platforms that give CreatorsHub a more complete view of your creator business.
          </p>
        </div>

        <Link
          href="/connected-accounts"
          className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-zinc-300 transition hover:text-white"
        >
          Manage Connections
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {recommendations
          .slice(0, 3)
          .map((platform) => (
            <ConnectionCard
              key={platform.key}
              platform={platform}
            />
          ))}
      </div>
    </section>
  );
}