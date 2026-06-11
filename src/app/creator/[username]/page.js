import { formatDate } from "@/lib/formatDate";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import FollowButton from "@/components/FollowButton";
import BuyNowButton from "@/components/BuyNowButton";
import VerifiedBadge from "@/components/VerifiedBadge";
import {
  getAccentBadgeClass,
  getAccentBorderClass,
} from "@/lib/accentColors";

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

export default async function CreatorProfilePage({ params }) {
  const { username } = await params;

  const { data: creator } = await supabase
    .from("creators")
    .select("*")
    .eq("username", username)
    .single();

  if (!creator) {
    return (
      <div className="min-h-screen bg-zinc-950 px-5 py-10 text-white">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold">Creator not found</h1>
          <p className="mt-3 text-zinc-400">
            This creator profile does not exist or is no longer available.
          </p>
        </div>
      </div>
    );
  }

  const { data: creatorProducts } = await supabase
    .from("products")
    .select("*")
    .eq("creator_id", creator.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const products = creatorProducts || [];

  const featuredProduct = products.find(
    (product) => product.id === creator.featured_product_id
  );

  const regularProducts = products.filter(
    (product) => product.id !== creator.featured_product_id
  );

  const { data: announcements } = await supabase
    .from("announcements")
    .select(`
      *,
      products (
        id,
        title
      )
    `)
    .eq("creator_id", creator.id)
    .eq("is_active", true)
    .eq("admin_hidden", false)
    .order("created_at", { ascending: false });

  const activeAnnouncements = announcements || [];

  const socialLinks = [
    { label: "YouTube", url: creator.social_links?.youtube },
    { label: "TikTok", url: creator.social_links?.tiktok },
    { label: "Instagram", url: creator.social_links?.instagram },
    { label: "Shopify", url: creator.social_links?.shopify },
    { label: "Patreon", url: creator.social_links?.patreon },
  ].filter((link) => link.url);

  const totalReviews = products.reduce(
    (sum, product) => sum + Number(product.reviews_count || 0),
    0
  );

  const ratedProducts = products.filter(
    (product) => Number(product.reviews_count || 0) > 0
  );

  const storefrontAverageRating =
    ratedProducts.length === 0
      ? "0.0"
      : (
          ratedProducts.reduce(
            (sum, product) => sum + Number(product.average_rating || 0),
            0
          ) / ratedProducts.length
        ).toFixed(1);

  return (
    <div className="min-h-screen bg-zinc-950 px-5 py-8 text-white md:p-10">
      <div className="mx-auto max-w-6xl space-y-10">
        <section className="relative overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-900 shadow-2xl">
          {creator.banner_url ? (
            <img
              src={creator.banner_url}
              alt={`${creator.display_name} banner`}
              className="h-[520px] w-full object-cover sm:h-[420px]"
            />
          ) : (
            <div className="h-[520px] w-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-black sm:h-[420px]" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/20" />

          <div className="absolute inset-x-0 bottom-0 z-10 p-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                {creator.avatar_url ? (
                  <img
                    src={creator.avatar_url}
                    alt={`${creator.display_name} avatar`}
                    className="h-24 w-24 rounded-full border-4 border-zinc-950 object-cover md:h-32 md:w-32"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-zinc-950 bg-zinc-800 text-zinc-500 md:h-32 md:w-32">
                    Avatar
                  </div>
                )}

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-bold md:text-5xl">
                      {creator.display_name}
                    </h1>

                    {creator.is_verified && <VerifiedBadge />}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <p className="text-zinc-300">@{creator.username}</p>

                    {creator.is_verified && (
                      <span className="rounded-full bg-zinc-950/80 px-3 py-1 text-xs font-semibold text-zinc-300">
                        Verified Creator
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {creator.niche && (
                      <span className="rounded-full bg-zinc-950/80 px-3 py-1 text-sm text-zinc-200">
                        {creator.niche}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-fit">
                <FollowButton creatorId={creator.id} />

                <Link
                  href="#products"
                  className="rounded-2xl border border-zinc-700 bg-zinc-950/80 px-5 py-3 text-center font-semibold text-white hover:bg-zinc-900"
                >
                  Shop Products
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Link
            href="#products"
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 transition hover:border-zinc-600 hover:bg-zinc-800"
          >
            <p className="text-sm text-zinc-400">Products</p>
            <p className="mt-1 text-2xl font-bold">{products.length}</p>
          </Link>

          <Link
            href="#announcements"
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 transition hover:border-zinc-600 hover:bg-zinc-800"
          >
            <p className="text-sm text-zinc-400">Announcements</p>
            <p className="mt-1 text-2xl font-bold">{activeAnnouncements.length}</p>
          </Link>

          <Link
            href="#about"
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 transition hover:border-zinc-600 hover:bg-zinc-800"
          >
            <p className="text-sm text-zinc-400">Total Reviews</p>

            <p className="mt-1 text-2xl font-bold">{totalReviews}</p>

            <p className="mt-2 text-xs text-zinc-500">
              Across all products
            </p>
          </Link>

          <Link
            href="#products"
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 transition hover:border-zinc-600 hover:bg-zinc-800"
          >
            <div className="group relative w-fit">
              <p className="cursor-help text-sm text-zinc-400">
                Average Rating ⓘ
              </p>

              <div className="pointer-events-none absolute left-0 top-full z-20 mt-2 hidden w-64 rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-xs text-zinc-400 shadow-xl group-hover:block">
                Average rating is based only on products that have at least one review.
              </div>
            </div>

            <p className="mt-1 text-2xl font-bold">{storefrontAverageRating}</p>

            <p className="mt-2 text-xs text-zinc-500">
              View products
            </p>
          </Link>
        </section>

        {featuredProduct && (
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-zinc-800" />
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
              Featured
            </p>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>
        )}

        {featuredProduct && (
          <section
            className={`overflow-hidden rounded-[2rem] border bg-gradient-to-br from-zinc-900 to-zinc-950 shadow-2xl ${getAccentBorderClass(
              creator.accent_color
            )}`}
          >
            <div className="grid gap-0 lg:grid-cols-[1fr_0.9fr]">
              <div className="p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`inline-block rounded-full px-4 py-2 text-sm font-semibold ${getAccentBadgeClass(
                      creator.accent_color
                    )}`}
                  >
                    ⭐ Featured Product
                  </span>

                  <span className="text-sm font-medium uppercase tracking-wide text-zinc-500">
                    Hand-Selected by the Creator
                  </span>
                </div>

                <h2 className="mt-5 text-3xl font-bold md:text-4xl">
                  {featuredProduct.title}
                </h2>

                {creator.featured_product_message && (
                  <p className="mt-3 text-lg text-zinc-300">
                    {creator.featured_product_message}
                  </p>
                )}

                {featuredProduct.description && (
                  <p className="mt-4 line-clamp-3 text-zinc-400">
                    {featuredProduct.description}
                  </p>
                )}

                <p className="mt-5 text-3xl font-bold">
                  {formatCurrency(featuredProduct.price)}
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <Link
                    href={`/product/${featuredProduct.id}`}
                    className="flex items-center justify-center rounded-2xl border border-zinc-700 px-5 py-3 text-center font-semibold text-zinc-200 transition hover:bg-zinc-800"
                  >
                    View Details
                  </Link>

                  <BuyNowButton
                    productId={featuredProduct.id}
                    externalUrl={featuredProduct.external_url}
                  />
                </div>
              </div>

              {featuredProduct.image_url ? (
                <img
                  src={featuredProduct.image_url}
                  alt={featuredProduct.title}
                  className="h-72 w-full object-cover lg:h-full"
                />
              ) : (
                <div className="flex h-72 items-center justify-center bg-zinc-800 text-zinc-500 lg:h-full">
                  Product Image
                </div>
              )}
            </div>
          </section>
        )}

        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-zinc-800" />
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
            Creator Info
          </p>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
          <div
            id="about"
            className="flex h-full flex-col rounded-[2rem] border border-zinc-800 bg-zinc-900 p-6"
          >
            <h2 className="text-2xl font-bold">About</h2>

            <p className="mt-2 text-sm text-zinc-500">
              Learn more about this creator and where to find them online.
            </p>

            <p className="mt-4 leading-relaxed text-zinc-400">
              {creator.bio ||
                "This creator has not added a bio yet. Check back soon for more information."}
            </p>

            {socialLinks.length > 0 && (
              <div className="mt-6">
                <div className="mb-3">
                  <p className="text-sm font-semibold text-zinc-500">
                    Connect
                  </p>

                  <p className="mt-1 text-xs text-zinc-600">
                    Follow this creator across their platforms.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                    >
                      {link.label} →
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div
            id="announcements"
            className="flex h-full flex-col rounded-[2rem] border border-zinc-800 bg-zinc-900 p-6"
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Latest Announcements</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  News, product drops, and announcements from this creator.
                </p>

                {activeAnnouncements.length > 3 && (
                  <p className="mt-2 text-xs text-zinc-600">
                    Showing latest 3 of {activeAnnouncements.length} announcements.
                  </p>
                )}
              </div>
            </div>

            {activeAnnouncements.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                <p className="font-semibold text-zinc-300">
                  No announcements yet
                </p>

                <p className="mt-2 text-sm text-zinc-500">
                  Follow this creator to stay updated when they share news, product drops, or announcements.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeAnnouncements.slice(0, 3).map((announcement) => (
                  <div
                    key={announcement.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-semibold">
                          {announcement.title}
                        </h3>

                        {announcement.content && (
                          <p className="mt-2 line-clamp-2 text-sm text-zinc-400">
                            {announcement.content}
                          </p>
                        )}
                      </div>

                      <p className="shrink-0 text-xs text-zinc-500">
                        {formatDate(announcement.created_at)}
                      </p>
                    </div>

                    {announcement.products && (
                      <Link
                        href={`/product/${announcement.products.id}`}
                        className="mt-4 inline-block text-sm font-semibold text-zinc-300 hover:text-white"
                      >
                        View linked product →
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-zinc-800" />
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
            Storefront
          </p>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        <section id="products">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold">Products</h2>

              <p className="mt-2 text-zinc-500">
                {featuredProduct
                  ? "Browse more products from this creator."
                  : "Browse this creator’s active products and offers."}
              </p>
            </div>

            <p className="text-sm text-zinc-500">
              {featuredProduct
                ? `${regularProducts.length} more product${regularProducts.length === 1 ? "" : "s"}`
                : `${products.length} total product${products.length === 1 ? "" : "s"}`}
            </p>
          </div>

          {products.length === 0 ? (
            <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900 p-8 text-center">
              <h3 className="text-2xl font-bold">No products listed yet</h3>

              <p className="mx-auto mt-2 max-w-xl text-zinc-400">
                This creator has not added any active products yet. Follow their storefront
                to be notified when new products or announcements are posted.
              </p>

              <div className="mt-6 flex justify-center">
                <FollowButton creatorId={creator.id} />
              </div>
            </div>
          ) : featuredProduct && regularProducts.length === 0 ? (
            <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900 p-8 text-center">
              <h3 className="text-2xl font-bold">No additional products</h3>

              <p className="mx-auto mt-2 max-w-xl text-zinc-400">
                This creator’s featured product is currently their only active product.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {(featuredProduct ? regularProducts : products).map((product) => (
                <div
                  key={product.id}
                  className="group flex flex-col rounded-[1.75rem] border border-zinc-800 bg-zinc-900 p-4 transition-all duration-200 hover:-translate-y-1 hover:border-zinc-600 hover:shadow-xl hover:shadow-black/20"
                >
                  <Link
                    href={`/product/${product.id}`}
                    className="flex flex-1 flex-col"
                  >
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="h-48 w-full rounded-2xl object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex h-48 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-500">
                        Product Image
                      </div>
                    )}

                    <div className="mt-4">
                      <h3 className="line-clamp-2 text-xl font-semibold group-hover:text-zinc-300">
                        {product.title}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                        {product.category && <span>{product.category}</span>}

                        {product.category && product.reviews_count > 0 && <span>•</span>}

                        {product.reviews_count > 0 && (
                          <>
                            <span>⭐ {Number(product.average_rating).toFixed(1)}</span>
                            <span>•</span>
                            <span>
                              {product.reviews_count} review
                              {product.reviews_count === 1 ? "" : "s"}
                            </span>
                          </>
                        )}
                      </div>

                      <p className="mt-3 line-clamp-2 min-h-[2.5rem] text-sm text-zinc-400">
                        {product.description || "View this product for more details."}
                      </p>

                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-2xl font-bold">
                          {formatCurrency(product.price)}
                        </p>

                        {product.inventory !== null &&
                          product.inventory !== undefined && (
                            <span className="text-xs text-zinc-500">
                              {product.inventory} left
                            </span>
                          )}
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-zinc-500 transition group-hover:text-white">
                          View Product →
                        </p>                        
                      </div>
                    </div>
                  </Link>

                  <div className="mt-auto space-y-3 pt-4">
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

        <section className="rounded-[2rem] border border-zinc-800 bg-zinc-900 p-8 text-center">
          <h2 className="text-3xl font-bold">Like this creator’s work?</h2>

          <p className="mx-auto mt-3 max-w-xl text-zinc-400">
            Follow this storefront to keep up with new products, announcements, and creator activity.
          </p>

          <div className="mt-6 flex justify-center">
            <FollowButton creatorId={creator.id} />
          </div>
        </section>
      </div>
    </div>
  );
}