"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import FavoriteButton from "@/components/FavoriteButton";
import BuyNowButton from "@/components/BuyNowButton";
import AddToCartButton from "@/components/AddToCartButton";

export default function FavoritesPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    async function loadFavorites() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("favorites")
        .select(`
          id,
          products (
            id,
            title,
            price,
            description,
            category,
            image_url,
            external_url,
            is_active,
            creators (
              display_name,
              username
            )
          )
        `)
        .eq("user_id", user.id);

      if (error) {
        alert(error.message);
      } else {
        setFavorites(
          (data || []).filter((favorite) => favorite.products?.is_active)
        );
      }

      setLoading(false);
    }

    loadFavorites();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold mb-4">Favorites</h1>

        <p className="text-zinc-400 text-lg mb-6">
          Products you saved for later.
        </p>

        <div className="flex flex-wrap gap-3 mb-10">
          <Link
            href="/store"
            className="bg-white text-black px-5 py-3 rounded-2xl font-semibold hover:bg-zinc-200 transition"
          >
            Browse Marketplace
          </Link>

          <Link
            href="/cart"
            className="border border-zinc-700 px-5 py-3 rounded-2xl hover:bg-zinc-800 transition"
          >
            View Purchase List
          </Link>
        </div>

        <p className="text-zinc-400 mb-6">
          Showing {favorites.length} saved product
          {favorites.length === 1 ? "" : "s"}
        </p>

        {favorites.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 text-center">
            <h2 className="text-3xl font-bold mb-4">
              No Favorites Yet
            </h2>

            <p className="text-zinc-400 text-lg">
              Save products you want to revisit later.
            </p>

            <Link
              href="/store"
              className="inline-block mt-8 bg-white text-black px-6 py-3 rounded-2xl font-semibold hover:bg-zinc-200 transition"
            >
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {favorites.map((favorite) => {
              const product = favorite.products;

              if (!product) return null;

              return (
                <div
                  key={favorite.id}
                  className="group bg-zinc-900 border border-zinc-800 rounded-3xl p-6 transition duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:shadow-2xl"
                >
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="h-48 w-full object-cover rounded-2xl mb-4 transition duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="h-48 bg-zinc-800 rounded-2xl mb-4 flex items-center justify-center text-zinc-500">
                      Product Image
                    </div>
                  )}

                  <Link
                    href={`/product/${product.id}`}
                    className="block text-2xl font-semibold hover:text-zinc-300 underline-offset-4 hover:underline"
                  >
                    {product.title}
                  </Link>

                  {product.creators && (
                    <Link
                      href={`/creator/${product.creators.username}`}
                      className="block mt-2 text-zinc-400 hover:text-white"
                    >
                      Sold by {product.creators.display_name}
                    </Link>
                  )}

                  {product.category && (
                    <span className="inline-block mt-3 bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm">
                      {product.category}
                    </span>
                  )}

                  {product.description && (
                    <p className="text-zinc-400 mt-2">
                      {product.description}
                    </p>
                  )}

                  <p className="text-2xl font-bold mt-4">
                    {product.price}
                  </p>

                  <div className="mt-5 space-y-3">
                    <BuyNowButton
                      productId={product.id}
                      externalUrl={product.external_url}
                    />

                    <AddToCartButton productId={product.id} />

                    <FavoriteButton productId={product.id} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}