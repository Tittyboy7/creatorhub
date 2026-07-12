export default function PlatformBriefSection({ brief }) {
  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Today&apos;s Brief
        </p>

        <h2 className="mt-1 text-2xl font-bold text-white">
          What deserves your attention
        </h2>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-sm font-semibold text-zinc-300">What happened</p>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            {brief.whatHappened}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-sm font-semibold text-zinc-300">Why it matters</p>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            {brief.whyItMatters}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-sm font-semibold text-zinc-300">What to do next</p>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            {brief.recommendation}
          </p>
        </div>
      </div>
    </section>
  );
}