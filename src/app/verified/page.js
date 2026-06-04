import Link from "next/link";

export default function VerifiedPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white px-5 py-8 md:p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Verified Creators
        </h1>

        <p className="text-zinc-400 text-lg leading-relaxed mb-6">
          Verified creators are accounts that CreatorsHub has reviewed for authenticity,
          trust, or platform significance.
        </p>

        <p className="text-zinc-400 text-lg leading-relaxed mb-8">
          Verification helps visitors identify creator storefronts that have been
          recognized by CreatorsHub.
        </p>

        <Link
          href="/creators"
          className="inline-block bg-white text-black px-6 py-3 rounded-2xl font-semibold hover:bg-zinc-200 transition"
        >
          Browse Creators
        </Link>
      </div>
    </div>
  );
}