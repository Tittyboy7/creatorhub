import { formatDate } from "@/lib/formatDate";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import BuyNowButton from "@/components/BuyNowButton";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { data: creators } = await supabase
    .from("creators")
    .select("*")
    .limit(3);

  const { data: products } = await supabase
    .from("products")
    .select(`
      *,
      creators (
       display_name,
        username
      )
    `)
    .eq("is_active", true)
    .limit(50);

  const { data: announcements } = await supabase
    .from("announcements")
    .select(`
      *,
      creators (
        display_name,
        username
    ),
    products (
      id,
      title
      )
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(3);

  const sortedProducts = (products || [])
    .sort(
      (a, b) =>
        ((b.views || 0) + (b.favorites_count || 0)) -
        ((a.views || 0) + (a.favorites_count || 0))
    )
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-10">
      <div className="max-w-7xl mx-auto space-y-16">
        <section className="text-center py-20">
          <h1 className="text-6xl font-bold mb-6">
            One hub for creators to sell everything.
          </h1>

          <p className="text-zinc-400 text-xl max-w-3xl mx-auto mb-10">
            CreatorHub helps creators centralize products, storefronts,
            social links, and external checkout pages in one simple profile.
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              href="/store"
              className="bg-white text-black px-8 py-4 rounded-2xl font-semibold"
            >
              Browse Marketplace
            </Link>

            <Link
              href="/signup"
              className="border border-zinc-700 px-8 py-4 rounded-2xl"
            >
              Create Account
            </Link>
          </div>
        </section>

        <section>
          <h2 className="text-4xl font-bold text-center mb-12">
            How CreatorHub Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
              <h3 className="text-2xl font-semibold mb-4">
                1. Create Your Storefront
              </h3>

              <p className="text-zinc-400">
                Build a creator profile with your products, links,
                announcements, and branding.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
              <h3 className="text-2xl font-semibold mb-4">
                2. Share Your Products
              </h3>

              <p className="text-zinc-400">
                Showcase products from your favorite platforms in one
                organized place.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
              <h3 className="text-2xl font-semibold mb-4">
                3. Grow Your Audience
              </h3>

              <p className="text-zinc-400">
                Gain followers, publish updates, and build stronger
                relationships with your community.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-4xl font-bold text-center mb-6">
            Why CreatorHub?
          </h2>

          <p className="text-zinc-400 text-lg text-center max-w-3xl mx-auto mb-12">
            CreatorHub gives creators one place to organize products, updates,
            audience activity, and business tools instead of spreading everything
            across disconnected links.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
              <h3 className="text-2xl font-semibold mb-4">
                More Than a Link Page
              </h3>

              <p className="text-zinc-400">
                Showcase products, announcements, reviews, and creator activity
                in one branded storefront.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
              <h3 className="text-2xl font-semibold mb-4">
                Built for Creator Businesses
              </h3>

              <p className="text-zinc-400">
                Track revenue, product interest, followers, notifications,
                and storefront performance from one dashboard.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
              <h3 className="text-2xl font-semibold mb-4">
                Platform-Agnostic Selling
              </h3>

              <p className="text-zinc-400">
                Link products from external stores while still giving fans one
                central place to browse everything you offer.
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center">
              <p className="text-5xl font-bold">
                {creators?.length || 0}
              </p>

              <p className="text-zinc-400 mt-3">
                Featured Creators
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center">
              <p className="text-5xl font-bold">
                {products?.length || 0}
              </p>

              <p className="text-zinc-400 mt-3">
                Active Products
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center">
              <p className="text-5xl font-bold">
                {announcements?.length || 0}
              </p>

              <p className="text-zinc-400 mt-3">
                Recent Updates
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-8">
            Latest Announcements
          </h2>

          {!announcements || announcements.length === 0 ? (
            <p className="text-zinc-400">No announcements yet.</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6"
                >
                  {announcement.creators && (
                    <Link
                      href={`/creator/${announcement.creators.username}`}
                      className="text-zinc-400 hover:text-white"
                    >
                      {announcement.creators.display_name}
                    </Link>
                  )}

                  <h3 className="text-2xl font-semibold mt-3">
                    {announcement.title}
                  </h3>

                  <p className="text-zinc-500 text-sm mt-1">
                    {formatDate(announcement.created_at)}
                  </p>

                  {announcement.content && (
                    <p className="text-zinc-400 mt-3">
                      {announcement.content}
                    </p>
                  )}

                  {announcement.products && (
                    <>
                      <span className="inline-block mt-4 bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm">
                        Linked Product
                      </span>

                      <Link
                        href={`/product/${announcement.products.id}`}
                        className="inline-block mt-4 bg-white text-black px-5 py-3 rounded-2xl font-semibold"
                      >
                        View Product: {announcement.products.title}
                      </Link>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
                <section>
          <h2 className="text-3xl font-bold mb-8">
            Featured Creators
          </h2>

          {!creators || creators.length === 0 ? (
            <p className="text-zinc-400">No creators yet.</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {creators.map((creator) => (
                <Link
                  key={creator.id}
                  href={`/creator/${creator.username}`}
                  className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden hover:border-zinc-600 transition"
                >
                  {creator.banner_url ? (
                    <img
                      src={creator.banner_url}
                      alt={creator.display_name}
                      className="h-32 w-full object-cover"
                    />
                  ) : (
                    <div className="h-32 bg-zinc-800" />
                  )}

                  <div className="p-6">
                    {creator.avatar_url ? (
                      <img
                        src={creator.avatar_url}
                        alt={creator.display_name}
                        className="w-20 h-20 object-cover rounded-full -mt-16 mb-4 border-4 border-zinc-900"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-zinc-700 -mt-16 mb-4 border-4 border-zinc-900" />
                    )}

                    <h3 className="text-2xl font-semibold">
                      {creator.display_name}
                    </h3>

                    <p className="text-zinc-400 mt-1">
                      @{creator.username}
                    </p>

                    {creator.niche && (
                      <span className="inline-block mt-3 bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm">
                        {creator.niche}
                      </span>
                    )}

                    {creator.bio && (
                      <p className="text-zinc-400 mt-4 line-clamp-2">
                        {creator.bio}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">
              Most Popular Products
            </h2>

            <Link
              href="/store"
              className="text-zinc-400 hover:text-white"
            >
              View all
            </Link>
          </div>

          {sortedProducts.length === 0 ? (
            <p className="text-zinc-400">No products yet.</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {sortedProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6"
                >
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="h-40 w-full object-cover rounded-2xl mb-4"
                    />
                  ) : (
                    <div className="h-40 bg-zinc-800 rounded-2xl mb-4" />
                  )}

                  <Link
                    href={`/product/${product.id}`}
                    className="block text-2xl font-semibold hover:text-zinc-300"
                  >
                    {product.title}
                  </Link>

                  {product.category && (
                    <span className="inline-block mt-3 bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm">
                      {product.category}
                    </span>
                  )}

                  <p className="text-2xl font-bold mt-4">
                    {product.price}
                  </p>

                  {product.reviews_count > 0 && (
                    <p className="text-zinc-500 mt-2">
                      ⭐ {Number(product.average_rating).toFixed(1)} / 5 ·{" "}
                      {product.reviews_count} review
                      {product.reviews_count === 1 ? "" : "s"}
                    </p>
                  )}

                  <p className="text-zinc-500 mt-2">
                    {product.views || 0} views •{" "}
                    {product.favorites_count || 0} favorites
                  </p>

                  {product.creators && (
                    <Link
                      href={`/creator/${product.creators.username}`}
                      className="block mt-4 text-zinc-400 hover:text-white"
                    >
                      Sold by {product.creators.display_name}
                    </Link>
                  )}

                  <BuyNowButton
                    productId={product.id}
                    externalUrl={product.external_url}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="text-center py-16">
          <h2 className="text-5xl font-bold mb-6">
            Ready to Build Your Creator Hub?
          </h2>

          <p className="text-zinc-400 text-xl max-w-2xl mx-auto mb-10">
            Create your storefront, share your products,
            connect with followers, and grow your creator business.
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              href="/signup"
              className="bg-white text-black px-8 py-4 rounded-2xl font-semibold"
            >
              Create Account
            </Link>

            <Link
              href="/creators"
              className="border border-zinc-700 px-8 py-4 rounded-2xl"
            >
              Explore Creators
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}