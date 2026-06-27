import Link from "next/link";

export default function ComparisonInsights({ businessComparisons = [] }) {
  if (businessComparisons.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 space-y-3">
      {businessComparisons.map((comparison) => (
        <div
          key={comparison.id}
          className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Comparison Insight
          </p>

          <h3 className="mt-2 text-xl font-bold">{comparison.title}</h3>

          <p className="mt-3 text-sm leading-6 text-zinc-400">
            {comparison.insight}
          </p>

          {comparison.action?.href && (
            <Link
              href={comparison.action.href}
              className="mt-4 inline-flex rounded-2xl border border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              {comparison.action.label} →
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}