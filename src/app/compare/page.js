"use client";

import Link from "next/link";

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-zinc-950 px-5 py-6 text-white md:px-10 md:py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Platform Comparison
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Compare your creator business across platforms
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">
            Compare revenue, products, views, followers, subscribers, donations,
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

        <section className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="text-xl font-bold">Comparison Controls</h2>

            <p className="mt-2 text-sm text-zinc-500">
              Choose platforms, metrics, and time ranges to compare.
            </p>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-sm font-semibold text-white">Platforms</p>
                <p className="mt-1 text-sm text-zinc-500">
                  YouTube, Twitch, Kick, Shopify, Patreon, and more.
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-sm font-semibold text-white">Metrics</p>
                <p className="mt-1 text-sm text-zinc-500">
                  Revenue, views, subscribers, sales, donations, and followers.
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-sm font-semibold text-white">Time Range</p>
                <p className="mt-1 text-sm text-zinc-500">
                  Compare changes across weeks, months, or custom periods.
                </p>
              </div>
            </div>
          </aside>

          <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-2xl font-bold">Comparison Canvas</h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              This area will show normalized charts once platforms and metrics are selected.
            </p>

            <div className="mt-6 rounded-3xl border border-dashed border-zinc-700 bg-zinc-950 p-10 text-center">
              <p className="text-sm font-semibold text-zinc-300">
                Select metrics to begin comparing platforms.
              </p>
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}