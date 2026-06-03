import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white px-5 py-8 md:p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">About CreatorsHub</h1>

        <p className="text-zinc-400 text-lg leading-relaxed mb-6">
          CreatorsHub is a platform for creators to showcase their work,
          organize products, connect with followers, and track their creator
          business in one place.
        </p>

        <p className="text-zinc-400 text-lg leading-relaxed mb-8">
          Our goal is to give creators a central home for storefronts,
          announcements, revenue tracking, analytics, and audience engagement.
        </p>

        <Link
          href="/store"
          className="inline-block bg-white text-black px-6 py-3 rounded-2xl font-semibold"
        >
          Explore Marketplace
        </Link>
      </div>
    </div>
  );
}