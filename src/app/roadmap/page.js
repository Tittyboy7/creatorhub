import Link from "next/link";

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-4">CreatorHub Roadmap</h1>

        <p className="text-zinc-400 text-lg mb-10">
          See what is live now and what is coming next.
        </p>

        <div className="grid gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <h2 className="text-3xl font-bold mb-4">Live Now</h2>

            <ul className="space-y-3 text-zinc-300">
              <li>✅ Creator profiles</li>
              <li>✅ Product marketplace</li>
              <li>✅ Favorites</li>
              <li>✅ Following</li>
              <li>✅ Creator feed</li>
              <li>✅ Reviews and ratings</li>
              <li>✅ Cart</li>
              <li>✅ Announcements</li>
              <li>✅ Creator analytics</li>
              <li>✅ Manual revenue tracking</li>
              <li>✅ Revenue CSV import</li>
              <li>✅ Revenue charts and filters</li>
            </ul>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <h2 className="text-3xl font-bold mb-4">Coming Soon</h2>

            <ul className="space-y-3 text-zinc-300">
              <li>⬜ Admin moderation tools</li>
              <li>⬜ Stripe checkout</li>
              <li>⬜ Creator notifications</li>
              <li>⬜ Advanced analytics</li>
              <li>⬜ Featured creator spots</li>
              <li>⬜ Advanced revenue graphs</li>
              <li>⬜ Platform API integrations</li>
              <li>⬜ Twitch, Kick, and YouTube analytics sync</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-8">
          <Link
            href="/"
            className="border border-zinc-700 px-6 py-3 rounded-2xl hover:bg-zinc-800"
          >
            Back Home
          </Link>

          <a
            href="mailto:hello@creatorhub.com?subject=Feature%20Suggestion"
            className="bg-white text-black px-6 py-3 rounded-2xl font-semibold"
          >
            Suggest a Feature
          </a>
        </div>
              </div>
            </div>
          );
        }