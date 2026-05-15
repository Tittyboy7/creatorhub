"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import FavoriteButton from "@/components/FavoriteButton";

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
            external_url
          )
        `)
        .eq("user_id", user.id);

      if (error) {
        alert(error.message);
      } else {
        setFavorites(data || []);
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

        <p className="text-zinc-400 text-lg mb-10">
          Products you saved.
        </p>

        {favorites.length === 0 ? (
          <p className="text-zinc-400">No saved products yet.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {favorites.map((favorite) => {
              const product = favorite.products;

              if (!product) return null;

              return (
                <div
                  key={favorite.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6"
                >
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="h-40 w-full object-cover rounded-2xl mb-4"
                    />
                  ) : (
                    <div className="h-40 bg-zinc-800 rounded-2xl mb-4 flex items-center justify-center text-zinc-500">
                      Product Image
                    </div>
                  )}

                  <h2 className="text-2xl font-semibold">
                    {product.title}
                  </h2>

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

                  {product.external_url && (
                    <a
                      href={product.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mt-4 text-center bg-white text-black py-3 rounded-2xl font-semibold"
                    >
                      Buy Now
                    </a>
                  )}

                  <FavoriteButton productId={product.id} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}