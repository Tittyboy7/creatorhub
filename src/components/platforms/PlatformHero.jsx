import Link from "next/link";

export default function PlatformHero() {
  return (
    <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Platform Hub
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
          Platform Hub
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Scan performance, health, and sync status across every connected platform.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/connected-accounts"
          className="rounded-2xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
        >
          Connect Platform
        </Link>

        <button className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200">
          Sync All
        </button>
      </div>
    </section>
  );
}