import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white px-5 py-8 md:p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Pricing
        </h1>

        <p className="text-zinc-400 text-lg mb-10">
          Start free. Upgrade when you are ready to grow your creator business.
        </p>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8">
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
              className="inline-block bg-white text-black px-6 py-3 rounded-2xl font-semibold hover:bg-zinc-200 transition"
            >
              Get Started
            </Link>
          </div>

          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white rounded-3xl p-6 md:p-8 shadow-2xl">
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
              className="inline-block border border-zinc-700 px-6 py-3 rounded-2xl hover:bg-zinc-800 transition"
            >
              View Roadmap
            </Link>
          </div>
        </div>

        <div className="mt-12 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8">
          <h2 className="text-3xl font-bold mb-6">
            Compare Plans
          </h2>

          <div className="space-y-4 text-zinc-300">
            <div className="flex justify-between gap-6 border-b border-zinc-800 pb-3">
              <span>Creator storefront</span>
              <span className="text-zinc-400">Free + Pro</span>
            </div>

            <div className="flex justify-between gap-6 border-b border-zinc-800 pb-3">
              <span>Product listings</span>
              <span className="text-zinc-400">Free + Pro</span>
            </div>

            <div className="flex justify-between gap-6 border-b border-zinc-800 pb-3">
              <span>Social links and announcements</span>
              <span className="text-zinc-400">Free + Pro</span>
            </div>

            <div className="flex justify-between gap-6 border-b border-zinc-800 pb-3">
              <span>Advanced analytics</span>
              <span className="text-zinc-400">Pro</span>
            </div>

            <div className="flex justify-between gap-6 border-b border-zinc-800 pb-3">
              <span>AI creator tools</span>
              <span className="text-zinc-400">Pro</span>
            </div>

            <div className="flex justify-between gap-6">
              <span>Priority discovery placement</span>
              <span className="text-zinc-400">Pro</span>
            </div>
          </div>

          <div className="mt-12 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Interested in CreatorsHub Pro?
            </h2>

            <p className="text-zinc-400 mb-6">
              Pro features are coming soon. Share feedback or request features on the roadmap.
            </p>

            <Link
              href="/roadmap"
              className="inline-block bg-white text-black px-6 py-3 rounded-2xl font-semibold hover:bg-zinc-200 transition"
            >
              Request Pro Features
            </Link>
          </div>
        </div>

        <div className="mt-12 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8">
          <h2 className="text-3xl font-bold mb-6">
            Pricing FAQ
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold">
                Can I use CreatorsHub for free?
              </h3>

              <p className="text-zinc-400 mt-2">
                Yes. Creators can start with a free storefront, product listings,
                social links, announcements, and basic analytics.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold">
                When will CreatorsHub Pro launch?
              </h3>

              <p className="text-zinc-400 mt-2">
                Pro features are planned for a future release as the platform grows.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold">
                Will CreatorsHub take a fee from my sales?
              </h3>

              <p className="text-zinc-400 mt-2">
                Not currently. Purchases are completed through each creator's external storefront, and CreatorsHub does not charge a transaction fee.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}