import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ReviewSection from "@/components/ReviewSection";
import { formatDate } from "@/lib/formatDate";
import BuyNowButton from "@/components/BuyNowButton";
import FavoriteButton from "@/components/FavoriteButton";
import AddToCartButton from "@/components/AddToCartButton";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }) {
  const { id } = await params;

  const { data: product } = await supabase
    .from("products")
    .select(`
      *,
      creators (
        display_name,
        username,
        avatar_url
      )
    `)
    .eq("id", id)
    .eq("is_active", true)
    .single();

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

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-5 py-8 md:p-10">
      <div className="max-w-6xl mx-auto space-y-10">
        <Link
          href="/store"
          className="inline-block border border-zinc-700 px-5 py-3 rounded-2xl hover:bg-zinc-800 transition"
        >
          Back to Marketplace
        </Link>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 md:gap-8 items-start">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 md:p-6">
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

            <p className="text-zinc-500 mb-6">
              Listed {formatDate(product.created_at)}
            </p>

            {product.creators && (
              <Link
                href={`/creator/${product.creators.username}`}
                className="flex items-center gap-3 mb-6 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition"
              >
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
                  <p className="text-zinc-500 text-sm">
                    Sold by
                  </p>

                  <p className="font-semibold">
                    {product.creators.display_name}
                  </p>
                </div>
              </Link>
            )}

            <p className="text-3xl md:text-4xl font-bold mb-5">
              {product.price}
            </p>

            {product.reviews_count > 0 && (
              <p className="text-zinc-400 mb-5 text-sm md:text-base">
                ⭐ {Number(product.average_rating).toFixed(1)} / 5 ·{" "}
                {product.reviews_count} review
                {product.reviews_count === 1 ? "" : "s"}
              </p>
            )}

            {product.description && (
              <p className="text-zinc-400 text-base md:text-lg leading-relaxed mb-6">
                {product.description}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center mb-8">
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
                <p className="text-2xl font-bold">
                  {product.views || 0}
                </p>
                <p className="text-zinc-500 text-xs md:text-sm">Views</p>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
                <p className="text-2xl font-bold">
                  {product.favorites_count || 0}
                </p>
                <p className="text-zinc-500 text-xs md:text-sm">Favorites</p>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
                <p className="text-2xl font-bold">
                  {product.checkout_clicks || 0}
                </p>
                <p className="text-zinc-500 text-xs md:text-sm">Checkouts</p>
              </div>
            </div>

            <div className="space-y-3">
              <BuyNowButton
                productId={product.id}
                externalUrl={product.external_url}
              />

              <FavoriteButton productId={product.id} />

              <AddToCartButton productId={product.id} />
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

        <ReviewSection productId={product.id} />
      </div>
    </div>
  );
}