"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SearchPage() {
  const [search, setSearch] = useState("");
  const [creators, setCreators] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function loadSearchData() {
      const { data: creatorData } = await supabase
        .from("creators")
        .select("*");

      const { data: productData } = await supabase
        .from("products")
        .select(`
          *,
          creators (
            display_name,
            username
          )
        `)
        .eq("is_active", true);

      setCreators(creatorData || []);
      setProducts(productData || []);
    }

    loadSearchData();
  }, []);

  const searchText = search.toLowerCase();

  const filteredCreators = creators.filter((creator) => {
    return (
      creator.display_name?.toLowerCase().includes(searchText) ||
      creator.username?.toLowerCase().includes(searchText) ||
      creator.niche?.toLowerCase().includes(searchText) ||
      creator.bio?.toLowerCase().includes(searchText)
    );
  });

  const filteredProducts = products.filter((product) => {
    return (
      product.title?.toLowerCase().includes(searchText) ||
      product.description?.toLowerCase().includes(searchText) ||
      product.category?.toLowerCase().includes(searchText) ||
      product.creators?.display_name?.toLowerCase().includes(searchText)
    );
  });

  const hasSearch = search.trim().length > 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-bold mb-4">
          Search
        </h1>

        <p className="text-zinc-400 text-lg mb-8">
          Find creators and products across CreatorsHub.
        </p>

        <input
          type="text"
          placeholder="Search CreatorsHub..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {!hasSearch ? (
          <div className="mt-10 bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <p className="text-zinc-400">
              Start typing to search creators and products.
            </p>
          </div>
        ) : (
          <div className="mt-10 space-y-10">
            <section>
              <h2 className="text-3xl font-bold mb-6">
                Creators
              </h2>

              {filteredCreators.length === 0 ? (
                <p className="text-zinc-400">
                  No creators found.
                </p>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredCreators.map((creator) => (
                    <Link
                      key={creator.id}
                      href={`/creator/${creator.username}`}
                      className="group bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:shadow-2xl"
                    >
                      {creator.banner_url ? (
                        <img
                          src={creator.banner_url}
                          alt={creator.display_name}
                          className="h-36 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="h-36 bg-gradient-to-br from-zinc-800 to-zinc-900" />
                      )}

                      <div className="p-6">
                        {creator.avatar_url ? (
                          <img
                            src={creator.avatar_url}
                            alt={creator.display_name}
                            className="relative z-10 w-20 h-20 object-cover rounded-full -mt-16 mb-4 border-4 border-zinc-900"
                          />
                        ) : (
                          <div className="relative z-10 w-20 h-20 rounded-full bg-zinc-700 -mt-16 mb-4 border-4 border-zinc-900" />
                        )}

                        <h3 className="text-2xl font-semibold">
                          {creator.display_name}
                        </h3>

                        <p className="text-zinc-500 mt-1">
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

                        <p className="text-zinc-500 mt-4 font-medium group-hover:text-white transition">
                          View Storefront →
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6">
                Products
              </h2>

              {filteredProducts.length === 0 ? (
                <p className="text-zinc-400">
                  No products found.
                </p>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.id}`}
                      className="group bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:shadow-2xl"
                    >
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="h-48 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="h-48 bg-zinc-800 flex items-center justify-center text-zinc-500">
                          Product Image
                        </div>
                      )}

                      <div className="p-6">
                        <h3 className="text-2xl font-semibold">
                          {product.title}
                        </h3>

                        {product.creators && (
                          <p className="text-zinc-500 mt-1">
                            Sold by {product.creators.display_name}
                          </p>
                        )}

                        {product.category && (
                          <span className="inline-block mt-3 bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm">
                            {product.category}
                          </span>
                        )}

                        {product.description && (
                          <p className="text-zinc-400 mt-4 line-clamp-2">
                            {product.description}
                          </p>
                        )}

                        <p className="text-xl font-bold mt-4">
                          {product.price}
                        </p>

                        <p className="text-zinc-500 mt-4 font-medium group-hover:text-white transition">
                          View Product →
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}