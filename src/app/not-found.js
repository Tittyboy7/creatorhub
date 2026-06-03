import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white px-5 py-8 md:p-10 flex items-center justify-center">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Page Not Found
        </h1>

        <p className="text-zinc-400 text-lg mb-8">
          This page may have moved, been removed, or never existed.
        </p>

        <div className="flex justify-center gap-3 flex-wrap">
          <Link
            href="/"
            className="bg-white text-black px-6 py-3 rounded-2xl font-semibold"
          >
            Go Home
          </Link>

          <Link
            href="/store"
            className="border border-zinc-700 px-6 py-3 rounded-2xl"
          >
            Browse Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}