export default function PlatformHero() {
  return (
    <section className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
          Platform Hub
        </h1>

        <p className="mt-2 text-sm leading-6 text-zinc-400 md:text-base">
          All your platforms. All your data. One place.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <button
          type="button"
          className="
            inline-flex
            min-h-12
            items-center
            justify-center
            gap-2
            rounded-2xl
            border
            border-zinc-700
            bg-zinc-900/80
            px-5
            py-3
            text-sm
            font-semibold
            text-zinc-200
            shadow-[0_10px_30px_rgba(0,0,0,0.18)]
            transition
            hover:border-zinc-600
            hover:bg-zinc-800
            hover:text-white
          "
        >
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

          Sync All Platforms
        </button>

        <div
          className="
            flex
            min-h-12
            items-center
            gap-3
            rounded-2xl
            border
            border-zinc-800
            bg-zinc-900/70
            px-4
            py-3
            backdrop-blur
          "
        >
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]"
          />

          <div>
            <p className="text-sm font-medium text-zinc-200">
              Synced 2 minutes ago
            </p>

            <p className="mt-0.5 text-xs text-zinc-500">
              All platform data up to date
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}