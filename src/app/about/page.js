import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-4">About CreatorHub</h1>

        <p className="text-zinc-400 text-lg leading-relaxed mb-8">
          CreatorHub is a platform where creators can build a storefront,
          share announcements, showcase products, and connect directly
          with their audience.
        </p>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-8">
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>

          <p className="text-zinc-300 leading-relaxed">
            We believe creators should have one place to sell everything:
            digital products, collectibles, merchandise, coaching, and more.
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-8">
          <h2 className="text-3xl font-bold mb-4">What You Can Do</h2>

          <ul className="space-y-3 text-zinc-300">
            <li>• Create a public creator profile</li>
            <li>• List products and external checkout links</li>
            <li>• Post announcements linked to products</li>
            <li>• Build a following and personalized feed</li>
            <li>• Save favorites and manage a cart</li>
            <li>• Collect ratings and reviews</li>
          </ul>
        </div>

        <Link
          href="/"
          className="inline-block border border-zinc-700 px-6 py-3 rounded-2xl hover:bg-zinc-800"
        >
          Back Home
        </Link>
      </div>
    </div>
  );
}