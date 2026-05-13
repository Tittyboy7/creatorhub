import Navbar from "@/components/Navbar";
export default function CreatorHubBeta() {
  const features = [
    {
      title: "Unified Storefront",
      description:
        "Sell physical products, digital downloads, memberships, and livestream drops from one profile.",
    },
    {
      title: "Creator Dashboard",
      description:
        "Track revenue, orders, followers, and engagement across all connected platforms.",
    },
    {
      title: "AI Product Builder",
      description:
        "Generate product pages, descriptions, pricing ideas, and creator branding instantly.",
    },
    {
      title: "Livestream Selling",
      description:
        "Host live drops and auctions for collectibles, merch, and exclusive content.",
    },
  ];

  const creators = [
    {
      name: "Pokemon Creator",
      revenue: "$12,430",
      products: 128,
      followers: "42K",
    },
    {
      name: "Gaming Streamer",
      revenue: "$8,920",
      products: 74,
      followers: "21K",
    },
    {
      name: "Anime Artist",
      revenue: "$5,140",
      products: 43,
      followers: "13K",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-10">
        <Navbar />
        

        <section className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="inline-block bg-zinc-800 px-4 py-2 rounded-full text-sm text-zinc-300">
              Creator Commerce Platform
            </div>

            <h2 className="text-5xl font-bold leading-tight">
              Centralize your content, store, fans, and revenue.
            </h2>

            <p className="text-zinc-400 text-lg leading-relaxed">
              Replace fragmented creator tools with one streamlined hub.
              Sell products, memberships, livestream drops, and digital
              content from one profile.
            </p>

            <div className="flex gap-4">
              <button className="bg-white text-black px-6 py-3 rounded-2xl font-semibold hover:scale-105 transition">
                Start Free
              </button>

              <button className="border border-zinc-700 px-6 py-3 rounded-2xl hover:bg-zinc-900 transition">
                Watch Demo
              </button>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-semibold">Revenue Dashboard</h3>
                <p className="text-zinc-500 text-sm">
                  Connected platforms overview
                </p>
              </div>

              <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                +28% Growth
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-zinc-800 rounded-2xl p-4">
                <p className="text-zinc-400 text-sm">Monthly Revenue</p>
                <h4 className="text-3xl font-bold mt-2">$28,940</h4>
              </div>

              <div className="bg-zinc-800 rounded-2xl p-4">
                <p className="text-zinc-400 text-sm">Orders</p>
                <h4 className="text-3xl font-bold mt-2">1,482</h4>
              </div>
            </div>

            <div className="space-y-4">
              {creators.map((creator, index) => (
                <div
                  key={index}
                  className="bg-zinc-800 rounded-2xl p-4 flex items-center justify-between"
                >
                  <div>
                    <h5 className="font-semibold">{creator.name}</h5>
                    <p className="text-zinc-500 text-sm">
                      {creator.followers} followers
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold">{creator.revenue}</p>
                    <p className="text-zinc-500 text-sm">
                      {creator.products} products
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-8">Core Features</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-600 transition"
              >
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-3xl p-10 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Build the operating system for creators.
          </h2>

          <p className="text-zinc-400 max-w-2xl mx-auto text-lg mb-8">
            Start with a simple creator storefront beta, then expand into
            memberships, analytics, livestream commerce, and creator tools.
          </p>

          <button className="bg-white text-black px-8 py-4 rounded-2xl font-semibold hover:scale-105 transition">
            Join the Beta Waitlist
          </button>
        </section>
      </div>
    </div>
  );
}
