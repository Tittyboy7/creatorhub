export default function PlatformReasonsSection({ reasons }) {
  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white">Why This Happened</h2>
        <p className="mt-1 text-sm text-zinc-500">
          The likely drivers behind today&apos;s platform performance.
        </p>
      </div>

      <div className="space-y-3">
        {reasons.map((reason, index) => (
          <div
            key={reason}
            className="flex gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-sm font-bold text-zinc-300">
              {index + 1}
            </span>

            <p className="text-sm leading-6 text-zinc-400">{reason}</p>
          </div>
        ))}
      </div>
    </section>
  );
}