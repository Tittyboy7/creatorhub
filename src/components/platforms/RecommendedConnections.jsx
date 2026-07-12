import Link from "next/link";

export default function RecommendedConnections({ recommendations }) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Recommended Connections</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Add platforms when they complete your business picture.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {recommendations.slice(0, 3).map((platform) => (
            <Link
              key={platform.key}
              href={`/connected-accounts/${platform.key}`}
              className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
            >
              + {platform.name}
            </Link>
          ))}

          <Link
            href="/connected-accounts"
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            Manage All
          </Link>
        </div>
      </div>
    </section>
  );
}