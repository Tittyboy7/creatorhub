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
    <div className="min-h-screen bg-zinc-950 text-white p-10">
      <h1 className="text-4xl font-bold">
        This product is no longer available.
      </h1>

      <Link
        href="/store"
        className="inline-block mt-6 bg-white text-black px-6 py-3 rounded-2xl font-semibold"
      >
        Back to Marketplace
      </Link>
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
    <div className="min-h-screen bg-zinc-950 text-white p-10">
      <div className="max-w-4xl mx-auto">
        {product.image_url && (
          <img
            src={product.image_url}
            alt={product.title}
            className="h-96 w-full object-cover rounded-3xl mb-8"
          />
        )}

        <h1 className="text-5xl font-bold mb-3">{product.title}</h1>

        <p className="text-zinc-500 mb-4">
          Listed {formatDate(product.created_at)}
        </p>

        {product.category && (
          <span className="inline-block bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm mb-6">
            {product.category}
          </span>
        )}

        {product.creators && (
          <Link
            href={`/creator/${product.creators.username}`}
            className="flex items-center gap-3 mb-6 text-zinc-400 hover:text-white"
          >
            {product.creators.avatar_url ? (
              <img
                src={product.creators.avatar_url}
                alt={product.creators.display_name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-zinc-700" />
            )}

            <span>
              Sold by {product.creators.display_name}
            </span>
          </Link>
        )}

        <p className="text-3xl font-bold mb-6">{product.price}</p>

        {product.reviews_count > 0 && (
          <p className="text-zinc-500 mb-4">
            ⭐ {Number(product.average_rating).toFixed(1)} / 5 ·{" "}
            {product.reviews_count} review
            {product.reviews_count === 1 ? "" : "s"}
          </p>
        )}

        {product.description && (
          <p className="text-zinc-400 text-lg leading-relaxed mb-8">
            {product.description}
          </p>
        )}

        <div className="text-zinc-500 mb-8 space-y-1">
          <p>{product.views || 0} views</p>
          <p>{product.favorites_count || 0} favorites</p>
          <p>{product.checkout_clicks || 0} checkout clicks</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <BuyNowButton
            productId={product.id}
            externalUrl={product.external_url}
          />

          {product.creators && (
            <Link
              href={`/creator/${product.creators.username}`}
              className="w-full border border-zinc-700 py-3 rounded-2xl flex items-center justify-center"
            >
              Back to Creator
            </Link>
          )}

          <Link
            href="/store"
            className="w-full border border-zinc-700 py-3 rounded-2xl flex items-center justify-center"
          >
            Back to Marketplace
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <FavoriteButton productId={product.id} />
          <AddToCartButton productId={product.id} />
        </div>

        <ReviewSection productId={product.id} />
      </div>
    </div>
  );
}