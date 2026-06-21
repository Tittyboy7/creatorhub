import Link from "next/link";

export default function RevenueHero() {
  return (
    <section className="rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6 md:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Creator Business
          </p>

          <h1 className="mt-2 text-4xl font-bold md:text-5xl">
            Revenue Dashboard
          </h1>

          <p className="mt-4 max-w-3xl text-zinc-400">
            Track, compare, and manage revenue across creator platforms,
            products, subscriptions, donations, sponsorships, and income
            streams.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/add-revenue"
            className="rounded-2xl bg-white px-6 py-3 font-semibold text-black hover:bg-zinc-200"
          >
            Add Revenue
          </Link>

          <Link
            href="/import-revenue"
            className="rounded-2xl border border-zinc-700 px-6 py-3 font-semibold hover:bg-zinc-800"
          >
            Import CSV
          </Link>
        </div>
      </div>
    </section>
  );
}