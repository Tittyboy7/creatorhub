function SummarySkeleton() {
  return (
    <div
      className="
        h-[108px]
        animate-pulse
        rounded-2xl
        border
        border-zinc-800
        bg-zinc-900/60
      "
    />
  );
}

function PlatformCardSkeleton() {
  return (
    <article
      className="
        rounded-3xl
        border
        border-zinc-800
        bg-zinc-900/60
        p-5
      "
    >
      <div className="animate-pulse">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-zinc-800" />

            <div>
              <div className="h-5 w-24 rounded bg-zinc-800" />
              <div className="mt-2 h-3 w-20 rounded bg-zinc-800/80" />
            </div>
          </div>

          <div className="h-8 w-20 rounded-full bg-zinc-800" />
        </div>

        <div className="mt-7">
          <div className="h-3 w-12 rounded bg-zinc-800/80" />

          <div className="mt-4 grid grid-cols-4 gap-4">
            {[0, 1, 2, 3].map(
              (item) => (
                <div
                  key={item}
                  className="min-w-0"
                >
                  <div className="h-3 w-12 rounded bg-zinc-800/70" />
                  <div className="mt-2 h-6 w-16 rounded bg-zinc-800" />
                  <div className="mt-2 h-3 w-10 rounded bg-zinc-800/70" />
                </div>
              )
            )}
          </div>
        </div>

        <div className="mt-6 border-y border-zinc-800/80 py-4">
          <div className="h-28 rounded-xl bg-zinc-800/60" />
        </div>

        <div className="mt-5">
          <div className="h-3 w-20 rounded bg-zinc-800/70" />

          <div className="mt-3 grid grid-cols-2 gap-2">
            {[0, 1, 2, 3].map(
              (item) => (
                <div
                  key={item}
                  className="h-10 rounded-xl bg-zinc-800/60"
                />
              )
            )}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-zinc-800/80 pt-4">
          <div className="h-3 w-28 rounded bg-zinc-800/70" />
          <div className="h-4 w-24 rounded bg-zinc-800/70" />
        </div>
      </div>
    </article>
  );
}

export default function PlatformsLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-6 text-white sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1480px] space-y-6">
        <section className="flex animate-pulse flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="h-10 w-52 rounded-lg bg-zinc-800" />

            <div className="mt-3 h-4 w-72 max-w-full rounded bg-zinc-800/70" />
          </div>

          <div className="flex gap-3">
            <div className="h-12 w-44 rounded-2xl bg-zinc-800" />
            <div className="h-12 w-56 rounded-2xl bg-zinc-800/70" />
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map(
            (item) => (
              <SummarySkeleton
                key={item}
              />
            )
          )}
        </section>

        <section className="space-y-3">
          <div className="animate-pulse">
            <div className="h-5 w-44 rounded bg-zinc-800" />
            <div className="mt-2 h-4 w-80 max-w-full rounded bg-zinc-800/70" />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {[0, 1, 2].map(
              (item) => (
                <PlatformCardSkeleton
                  key={item}
                />
              )
            )}
          </div>
        </section>

        <section
          className="
            animate-pulse
            rounded-3xl
            border
            border-zinc-800
            bg-zinc-900/60
            p-5
          "
        >
          <div className="h-4 w-40 rounded bg-zinc-800/70" />
          <div className="mt-3 h-6 w-56 rounded bg-zinc-800" />
          <div className="mt-3 h-4 w-96 max-w-full rounded bg-zinc-800/70" />

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map(
              (item) => (
                <div
                  key={item}
                  className="h-32 rounded-2xl border border-zinc-800 bg-black/10"
                />
              )
            )}
          </div>
        </section>
      </div>
    </div>
  );
}