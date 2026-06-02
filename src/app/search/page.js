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
                      className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-700 transition"
                    >
                      <h3 className="text-2xl font-semibold">
                        {creator.display_name}
                      </h3>

                      <p className="text-zinc-500 mt-1">
                        @{creator.username}
                      </p>

                      {creator.niche && (
                        <p className="text-zinc-400 mt-3">
                          {creator.niche}
                        </p>
                      )}
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
                      className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-700 transition"
                    >
                      <h3 className="text-2xl font-semibold">
                        {product.title}
                      </h3>

                      {product.creators && (
                        <p className="text-zinc-500 mt-1">
                          Sold by {product.creators.display_name}
                        </p>
                      )}

                      {product.category && (
                        <p className="text-zinc-400 mt-3">
                          {product.category}
                        </p>
                      )}

                      <p className="text-xl font-bold mt-4">
                        {product.price}
                      </p>
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