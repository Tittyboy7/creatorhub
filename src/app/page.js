import { formatDate } from "@/lib/formatDate";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import BuyNowButton from "@/components/BuyNowButton";
import VerifiedBadge from "@/components/VerifiedBadge";

export const dynamic = "force-dynamic";

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") {
    return "$0.00";
  }

  const cleanedValue = String(value).replace(/[^0-9.-]/g, "");
  const numberValue = Number(cleanedValue);

  if (Number.isNaN(numberValue)) {
    return String(value);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(numberValue);
}

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
    .eq("admin_hidden", false)
    .order("created_at", { ascending: false })
    .limit(3);

  const sortedProducts = (products || [])
    .sort(
      (a, b) =>
        (b.views || 0) +
        (b.favorites_count || 0) -
        ((a.views || 0) + (a.favorites_count || 0))
    )
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-zinc-950 px-5 py-8 text-white md:p-10">
      <div className="mx-auto max-w-7xl space-y-20">
        <section className="rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black px-6 py-16 text-center shadow-2xl md:px-10 md:py-24">
          <p className="mb-5 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            CreatorsHub
          </p>

          <h1 className="mx-auto max-w-4xl text-4xl font-bold md:text-7xl">
            Build your creator business in one place.
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-zinc-400 md:text-xl">
            CreatorsHub gives creators one place to manage products,
            storefronts, announcements, followers, revenue tracking, and
            audience growth.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-2xl bg-white px-8 py-4 font-semibold text-black transition hover:bg-zinc-200"
            >
              Start Building
            </Link>

            <Link
              href="/announcements"
              className="text-sm font-semibold text-zinc-400 hover:text-white"
            >
              View all announcements →
            </Link>
          </div>

          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-3 text-sm text-zinc-400 md:grid-cols-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
              Storefronts
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
              Products
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
              Revenue
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
              Growth
            </div>
          </div>
        </section>

        <section>
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">
              How CreatorsHub Works
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-zinc-400">
              Create a storefront, organize your products, grow your audience,
              and track your creator business from one dashboard.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 md:p-8">
              <p className="mb-4 text-sm font-semibold text-zinc-500">
                Step 1
              </p>

              <h3 className="text-2xl font-semibold">
                Build Your Creator Profile
              </h3>

              <p className="mt-4 text-zinc-400">
                Create a branded storefront with your bio, products, social
                links, announcements, and creator identity.
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 md:p-8">
              <p className="mb-4 text-sm font-semibold text-zinc-500">
                Step 2
              </p>

              <h3 className="text-2xl font-semibold">
                Manage Products and Announcements
              </h3>

              <p className="mt-4 text-zinc-400">
                Add products, link external stores, publish announcements, and
                keep followers informed from one dashboard.
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 md:p-8">
              <p className="mb-4 text-sm font-semibold text-zinc-500">
                Step 3
              </p>

              <h3 className="text-2xl font-semibold">
                Track Growth
              </h3>

              <p className="mt-4 text-zinc-400">
                Monitor revenue, followers, product interest, reviews, and
                storefront activity as your creator business grows.
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-10 text-center">
            <h2 className="text-4xl font-bold">
              Creator business tools in one dashboard
            </h2>

            <p className="mx-auto mt-4 max-w-3xl text-lg text-zinc-400">
              CreatorsHub combines storefronts, products, announcements,
              followers, revenue tracking, and creator analytics into one
              platform built for modern creator businesses.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 md:p-8">
              <h3 className="text-2xl font-semibold">
                Creator Storefronts
              </h3>

              <p className="mt-4 text-zinc-400">
                Showcase products, announcements, reviews, and creator activity
                in one branded storefront.
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 md:p-8">
              <h3 className="text-2xl font-semibold">
                Business Dashboard
              </h3>

              <p className="mt-4 text-zinc-400">
                Track revenue, product interest, followers, notifications, and
                storefront performance from one dashboard.
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 md:p-8">
              <h3 className="text-2xl font-semibold">
                External Selling Support
              </h3>

              <p className="mt-4 text-zinc-400">
                Link products from external stores while still giving fans one
                central place to browse everything you offer.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-zinc-800 bg-zinc-900 p-8 text-center md:p-12">
          <h2 className="text-4xl font-bold">
            Built for long-term creator growth
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-zinc-400">
            CreatorsHub helps creators build a lasting business by combining
            storefronts, products, audience engagement, announcements, reviews,
            verification, and performance tracking into one platform.
          </p>
        </section>

        <section>
          <div className="mb-10 text-center">
            <h2 className="text-4xl font-bold">
              Growing Creator Ecosystem
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-zinc-400">
              Creators, products, and community activity all in one place.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center">
              <p className="text-5xl font-bold">{creators?.length || 0}</p>

              <p className="mt-3 text-zinc-400">
                Creators Featured
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center">
              <p className="text-5xl font-bold">{products?.length || 0}</p>

              <p className="mt-3 text-zinc-400">
                Products Available
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center">
              <p className="text-5xl font-bold">
                {announcements?.length || 0}
              </p>

              <p className="mt-3 text-zinc-400">
                Latest Announcements
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-zinc-800 bg-zinc-900 p-8 text-center">
          <h2 className="text-3xl font-bold">
            Built for creators across every niche
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
            Whether you create content, digital products, courses, artwork,
            music, software, coaching, or physical products, CreatorsHub helps
            you organize your creator business in one place.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {[
              "Content",
              "Digital Products",
              "Courses",
              "Art",
              "Coaching",
              "Physical Products",
            ].map((niche) => (
              <span
                key={niche}
                className="rounded-full bg-zinc-800 px-4 py-2 text-sm text-zinc-300"
              >
                {niche}
              </span>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Community
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                Latest Announcements
              </h2>
            </div>

            <Link
              href="/announcements"
              className="text-sm font-semibold text-zinc-400 hover:text-white"
            >
              View all announcements →
            </Link>
          </div>

          {!announcements || announcements.length === 0 ? (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center">
              <p className="text-zinc-400">No announcements yet.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
                >
                  {announcement.creators && (
                    <Link
                      href={`/creator/${announcement.creators.username}`}
                      className="text-sm font-semibold text-zinc-400 hover:text-white"
                    >
                      {announcement.creators.display_name}
                    </Link>
                  )}

                  <h3 className="mt-3 text-2xl font-semibold">
                    {announcement.title}
                  </h3>

                  <p className="mt-1 text-sm text-zinc-500">
                    {formatDate(announcement.created_at)}
                  </p>

                  {announcement.content && (
                    <p className="mt-3 line-clamp-3 text-zinc-400">
                      {announcement.content}
                    </p>
                  )}

                  {announcement.products && (
                    <Link
                      href={`/product/${announcement.products.id}`}
                      className="mt-5 inline-block rounded-2xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-zinc-200"
                    >
                      View Product
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Featured
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                Featured Creators
              </h2>
            </div>

            <Link
              href="/creators"
              className="text-sm font-semibold text-zinc-400 hover:text-white"
            >
              View all creators →
            </Link>
          </div>

          {!creators || creators.length === 0 ? (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center">
              <p className="text-zinc-400">No creators yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
              {creators.map((creator) => (
                <Link
                  key={creator.id}
                  href={`/creator/${creator.username}`}
                  className="group overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 transition hover:-translate-y-1 hover:border-zinc-600"
                >
                  {creator.banner_url ? (
                    <img
                      src={creator.banner_url}
                      alt={creator.display_name}
                      className="h-24 w-full object-cover md:h-36"
                    />
                  ) : (
                    <div className="h-24 bg-zinc-800 md:h-36" />
                  )}

                  <div className="p-4 md:p-6">
                    {creator.avatar_url ? (
                      <img
                        src={creator.avatar_url}
                        alt={creator.display_name}
                        className="-mt-14 mb-4 h-20 w-20 rounded-full border-4 border-zinc-900 object-cover"
                      />
                    ) : (
                      <div className="-mt-14 mb-4 h-20 w-20 rounded-full border-4 border-zinc-900 bg-zinc-700" />
                    )}

                    <h3 className="flex items-center gap-2 text-lg font-semibold md:text-2xl">
                      <span className="line-clamp-1">
                        {creator.display_name}
                      </span>

                      {creator.is_verified && <VerifiedBadge />}
                    </h3>

                    <p className="mt-1 text-sm text-zinc-400">
                      @{creator.username}
                    </p>

                    {creator.niche && (
                      <span className="mt-3 inline-block rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-300">
                        {creator.niche}
                      </span>
                    )}

                    {creator.bio && (
                      <p className="mt-4 line-clamp-2 text-sm text-zinc-400">
                        {creator.bio}
                      </p>
                    )}

                    <p className="mt-5 text-sm font-semibold text-zinc-500 group-hover:text-white">
                      View storefront →
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Marketplace
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                Most Popular Products
              </h2>
            </div>

            <Link
              href="/store"
              className="text-sm font-semibold text-zinc-400 hover:text-white"
            >
              View all products →
            </Link>
          </div>

          {sortedProducts.length === 0 ? (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center">
              <p className="text-zinc-400">No products yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
              {sortedProducts.map((product) => (
                <div
                  key={product.id}
                  className="group flex flex-col rounded-3xl border border-zinc-800 bg-zinc-900 p-4 transition hover:-translate-y-1 hover:border-zinc-600 md:p-6"
                >
                  <Link
                    href={`/product/${product.id}`}
                    className="flex flex-1 flex-col"
                  >
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="h-32 w-full rounded-2xl object-cover transition group-hover:scale-[1.02] md:h-44"
                      />
                    ) : (
                      <div className="flex h-32 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-500 md:h-44">
                        Product Image
                      </div>
                    )}

                    <h3 className="mt-4 text-xl font-semibold group-hover:text-zinc-300 md:text-2xl">
                      {product.title}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                      {product.category && <span>{product.category}</span>}

                      {product.category && product.reviews_count > 0 && (
                        <span>•</span>
                      )}

                      {product.reviews_count > 0 && (
                        <>
                          <span>
                            ⭐ {Number(product.average_rating).toFixed(1)}
                          </span>

                          <span>•</span>

                          <span>
                            {product.reviews_count} review
                            {product.reviews_count === 1 ? "" : "s"}
                          </span>
                        </>
                      )}
                    </div>

                    <p className="mt-4 text-xl font-bold md:text-2xl">
                      {formatCurrency(product.price)}
                    </p>

                    {product.creators && (
                      <p className="mt-3 text-sm text-zinc-400">
                        Sold by {product.creators.display_name}
                      </p>
                    )}

                    <p className="mt-5 text-sm font-semibold text-zinc-500 group-hover:text-white">
                      View product →
                    </p>
                  </Link>

                  <div className="mt-auto pt-4">
                    <BuyNowButton
                      productId={product.id}
                      externalUrl={product.external_url}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[2rem] border border-zinc-800 bg-zinc-900 p-8 text-center md:p-12">
          <h2 className="text-3xl font-bold md:text-5xl">
            Ready to build your creator business?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400">
            Create your storefront, share your products, connect with
            followers, and grow your creator business with CreatorsHub.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-2xl bg-white px-8 py-4 font-semibold text-black transition hover:bg-zinc-200"
            >
              Create Account
            </Link>

            <Link
              href="/creators"
              className="rounded-2xl border border-zinc-700 px-8 py-4 font-semibold transition hover:bg-zinc-800"
            >
              Explore Creators
            </Link>

            <Link
              href="/pricing"
              className="rounded-2xl border border-zinc-700 px-8 py-4 font-semibold transition hover:bg-zinc-800"
            >
              View Pricing
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}