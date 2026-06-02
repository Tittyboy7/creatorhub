import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold mb-4">
          Pricing
        </h1>

        <p className="text-zinc-400 text-lg mb-10">
          Start free. Upgrade when you are ready to grow your creator business.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <h2 className="text-3xl font-bold mb-3">
              Free
            </h2>

            <p className="text-4xl font-bold mb-6">
              $0
            </p>

            <ul className="space-y-3 text-zinc-400 mb-8">
              <li>Creator storefront</li>
              <li>Product listings</li>
              <li>Social links</li>
              <li>Announcements</li>
              <li>Basic analytics</li>
            </ul>

            <Link
              href="/signup"
              className="inline-block bg-white text-black px-6 py-3 rounded-2xl font-semibold"
            >
              Get Started
            </Link>
          </div>

          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white rounded-3xl p-8 shadow-2xl">
            <span className="inline-block mb-4 bg-white text-black px-3 py-1 rounded-full text-sm font-semibold">
              Coming Soon
            </span>

            <h2 className="text-3xl font-bold mb-3">
              CreatorsHub Pro
            </h2>

            <p className="text-4xl font-bold mb-6">
              $12/mo
            </p>

            <ul className="space-y-3 text-zinc-400 mb-8">
              <li>Advanced analytics</li>
              <li>More storefront customization</li>
              <li>Priority discovery placement</li>
              <li>AI creator tools</li>
              <li>Email audience tools</li>
            </ul>

            <Link
              href="/roadmap"
              className="inline-block border border-zinc-700 px-6 py-3 rounded-2xl"
            >
              View Roadmap
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}