import Link from "next/link";

export default function ComparisonHero() {
  return (
    <section className="rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6 md:p-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
        Platform Comparison
      </p>

      <h1 className="mt-2 text-4xl font-bold">
        Compare your creator business across platforms
      </h1>

      <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">
        Compare revenue, product activity, audience growth, commerce, payments,
        and future platform metrics in one place.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/dashboard"
          className="rounded-2xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white"
        >
          Back to Dashboard
        </Link>

        <Link
          href="/revenue"
          className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-zinc-200"
        >
          Revenue Intelligence
        </Link>
      </div>
    </section>
  );
}