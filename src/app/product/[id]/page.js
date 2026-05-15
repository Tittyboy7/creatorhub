import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ReviewSection from "@/components/ReviewSection";

export default async function ProductPage({ params }) {
  const { id } = await params;

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!product) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-10">
        <h1 className="text-4xl font-bold">Product not found</h1>
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

        <h1 className="text-5xl font-bold mb-4">{product.title}</h1>

        {product.category && (
          <span className="inline-block bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm mb-6">
            {product.category}
          </span>
        )}

        <p className="text-3xl font-bold mb-6">{product.price}</p>

        {product.description && (
          <p className="text-zinc-400 text-lg leading-relaxed mb-8">
            {product.description}
          </p>
        )}

        <p className="text-zinc-500 mb-8">{product.views || 0} views</p>

        <div className="flex gap-4">
        {product.external_url ? (
          <a
            href={product.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-4 w-full text-center bg-white text-black py-3 rounded-2xl font-semibold"
          >
            Buy Now
          </a>
        ) : (
          <button
            className="block mt-4 w-full text-center bg-white text-black py-3 rounded-2xl font-semibold"
          >
            Buy Now
          </button>
        )}

          <Link
            href="/store"
            className="border border-zinc-700 px-6 py-3 rounded-2xl"
          >
            Back to Marketplace
          </Link>
        </div>
        <ReviewSection productId={product.id} />
      </div>
    </div>
  );
}