import Link from "next/link";

export default function ChangelogPage() {
  const updates = [
    {
      version: "v0.1",
      title: "Creator Profiles",
      description:
        "Creators can create storefront profiles with banners, avatars, and product listings.",
    },
    {
      version: "v0.2",
      title: "Marketplace",
      description:
        "Added marketplace browsing, product pages, favorites, and purchase lists.",
    },
    {
      version: "v0.3",
      title: "Notifications & Following",
      description:
        "Added creator notifications, following, and personalized feeds.",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-bold mb-4">
          Changelog
        </h1>

        <p className="text-zinc-400 text-lg mb-10">
          Track what’s new on CreatorsHub.
        </p>

        <div className="space-y-6">
          {updates.map((update) => (
            <div
              key={update.version}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6"
            >
              <p className="text-zinc-500 mb-2">
                {update.version}
              </p>

              <h2 className="text-2xl font-bold mb-2">
                {update.title}
              </h2>

              <p className="text-zinc-400">
                {update.description}
              </p>
            </div>
          ))}
        </div>

        <Link
          href="/roadmap"
          className="inline-block mt-10 bg-white text-black px-6 py-3 rounded-2xl font-semibold"
        >
          View Roadmap
        </Link>
      </div>
    </div>
  );
}