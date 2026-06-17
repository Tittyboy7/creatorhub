import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ReviewSection from "@/components/ReviewSection";
import { formatDate } from "@/lib/formatDate";
import BuyNowButton from "@/components/BuyNowButton";
import FavoriteButton from "@/components/FavoriteButton";
import AddToCartButton from "@/components/AddToCartButton";

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

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }) {
  const { id } = await params;

  const { data: product, error: productError } = await supabase
    .from("products")
    .select(`
      *,
      creators (
        display_name,
        username,
        avatar_url,
        is_verified
      )
    `)
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

    if (productError) {
      console.error("Product page Supabase error:", productError.message);
    }

  if (!product) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white px-5 py-8 md:p-10">
        <div className="max-w-4xl mx-auto bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold">
            This product is no longer available.
          </h1>

          <Link
            href="/store"
            className="inline-block mt-6 bg-white text-black px-6 py-3 rounded-2xl font-semibold hover:bg-zinc-200 transition"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  await supabase
    .from("products")
    .update({
      views: (product.views || 0) + 1,
    })
    .eq("id", product.id);

    const { data: relatedProducts } = await supabase
      .from("products")
      .select("*")
      .eq("creator_id", product.creator_id)
      .eq("is_active", true)
      .neq("id", product.id)
      .limit(3);

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-5 py-8 md:p-10">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/store"
            className="text-sm font-semibold text-zinc-400 hover:text-white"
          >
            ← Back to Marketplace
          </Link>

          {product.creators && (
            <Link
              href={`/creator/${product.creators.username}`}
              className="text-sm font-semibold text-zinc-400 hover:text-white"
            >
              View Creator Storefront →
            </Link>
          )}
        </div>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 md:gap-8 items-start">
          <div className="sticky top-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-4 md:p-6">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.title}
                className="h-72 md:h-[460px] w-full object-cover rounded-2xl"
              />
            ) : (
              <div className="h-72 md:h-[460px] w-full bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500">
                Product Image
              </div>
            )}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 md:p-8">
            {product.category && (
              <span className="inline-block bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm mb-5">
                {product.category}
              </span>
            )}

            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              {product.title}
            </h1>

            <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
              <span>
                Listed {formatDate(product.created_at)}
              </span>

              {product.reviews_count > 0 && (
                <>
                  <span>•</span>

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

            <p className="text-3xl md:text-4xl font-bold mb-5">
              {formatCurrency(product.price)}
            </p>

            {product.creators && (
              <Link
                href={`/creator/${product.creators.username}`}
                className="flex items-center justify-between gap-4 mb-6 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition"
              >
                <>
                  <div className="flex items-center gap-3">
                    {product.creators.avatar_url ? (
                      <img
                        src={product.creators.avatar_url}
                        alt={product.creators.display_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-zinc-700" />
                    )}

                    <div>
                      <p className="text-sm text-zinc-500">
                        Sold by creator
                      </p>

                      <div className="flex items-center gap-2">
                        <p className="font-semibold">
                          {product.creators.display_name}
                        </p>

                        {product.creators.is_verified && (
                          <span className="rounded-full border border-green-800 bg-green-950 px-3 py-1 text-xs font-semibold text-green-400">
                            ✓ Verified Creator
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="hidden text-sm font-semibold text-zinc-400 sm:block">
                    View Store →
                  </span>
                </>
              </Link>
            )}

            <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="mb-2 text-sm font-semibold text-zinc-300">
                Product Details
              </p>

              <p className="text-base leading-relaxed text-zinc-400 md:text-lg">
                {product.description || "No product description has been added yet."}
              </p>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-sm font-semibold text-zinc-300">
                  Viewed by shoppers
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  {product.views || 0} total views
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-sm font-semibold text-zinc-300">
                  Saved by fans
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  {product.favorites_count || 0} favorites
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-sm font-semibold text-zinc-300">
                  Purchase interest
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  {product.checkout_clicks || 0} checkout clicks
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <BuyNowButton
                productId={product.id}
                externalUrl={product.external_url}
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FavoriteButton productId={product.id} />

                <AddToCartButton productId={product.id} />
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-zinc-500">
              Checkout may open on the creator’s external store if this product uses an outside link.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3 text-center text-zinc-400">
                Creator-owned listing
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3 text-center text-zinc-400">
                External checkout supported
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3 text-center text-zinc-400">
                {product.favorites_count || 0} saved by fans
              </div>
            </div>

            {product.creators && (
              <Link
                href={`/creator/${product.creators.username}`}
                className="block mt-5 w-full border border-zinc-700 py-3 rounded-2xl text-center hover:bg-zinc-800 transition"
              >
                View Creator Storefront
              </Link>
            )}
          </div>
        </div>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 md:p-8">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Customer Feedback
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Reviews
            </h2>

            <p className="mt-2 text-zinc-400">
              See what buyers and fans are saying about this product.
            </p>

            <div className="mt-4 flex flex-wrap gap-3 text-sm text-zinc-500">
              {product.reviews_count > 0 ? (
                <>
                  <span>⭐ {Number(product.average_rating).toFixed(1)} average rating</span>
                  <span>•</span>
                  <span>
                    {product.reviews_count} review
                    {product.reviews_count === 1 ? "" : "s"}
                  </span>
                </>
              ) : (
                <span>No reviews yet</span>
              )}
            </div>
          </div>

          <ReviewSection productId={product.id} />
        </section>
        {relatedProducts && relatedProducts.length > 0 && (
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 md:p-8">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                  More From This Creator
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  Related Products
                </h2>
              </div>

              {product.creators && (
                <Link
                  href={`/creator/${product.creators.username}`}
                  className="text-sm font-semibold text-zinc-400 hover:text-white"
                >
                  View storefront →
                </Link>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/product/${relatedProduct.id}`}
                  className="group rounded-2xl border border-zinc-800 bg-zinc-950 p-4 transition hover:-translate-y-1 hover:border-zinc-600"
                >
                  {relatedProduct.image_url ? (
                    <img
                      src={relatedProduct.image_url}
                      alt={relatedProduct.title}
                      className="h-40 w-full rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-40 items-center justify-center rounded-xl bg-zinc-800 text-zinc-500">
                      Product Image
                    </div>
                  )}

                  <h3 className="mt-4 text-xl font-semibold group-hover:text-zinc-300">
                    {relatedProduct.title}
                  </h3>

                  {relatedProduct.category && (
                    <p className="mt-2 text-sm text-zinc-500">
                      {relatedProduct.category}
                    </p>
                  )}

                  <p className="mt-3 text-xl font-bold">
                    {formatCurrency(relatedProduct.price)}
                  </p>

                  <p className="mt-4 text-sm font-semibold text-zinc-500 group-hover:text-white">
                    View product →
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}