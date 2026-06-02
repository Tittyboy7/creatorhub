import Link from "next/link";

export default function GuidelinesPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-6">
          Community Guidelines
        </h1>

        <p className="text-zinc-400 text-lg leading-relaxed mb-6">
          CreatorsHub is built to help creators share products, updates,
          and storefronts in a safe and respectful environment.
        </p>

        <p className="text-zinc-400 text-lg leading-relaxed mb-6">
          Creators should publish honest, accurate, and appropriate content.
          Products, announcements, and profiles should not mislead users or
          harm the community.
        </p>

        <p className="text-zinc-400 text-lg leading-relaxed mb-6">
          Users should interact respectfully with creators and other members
          of the platform.
        </p>

        <p className="text-zinc-400 text-lg leading-relaxed mb-8">
          These guidelines may evolve as CreatorsHub grows.
        </p>

        <Link
          href="/"
          className="inline-block bg-white text-black px-6 py-3 rounded-2xl font-semibold"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}