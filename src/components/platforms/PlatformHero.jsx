export default function PlatformHero() {
  return (
    <section className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-400">
          Platform Intelligence
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
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
            border-white/80
            bg-white
            px-5
            py-3
            text-sm
            font-semibold
            text-zinc-950
            shadow-[0_0_30px_rgba(255,255,255,0.08)]
            transition
            hover:bg-zinc-200
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
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
              Last sync
            </p>

            <p className="mt-0.5 text-sm font-medium text-zinc-200">
              2 minutes ago
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}