"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function StorePage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    async function loadProducts() {
      const { data } = await supabase.from("products").select(`
        *,
        creators (
          display_name,
          username
        )
      `);

      setProducts(data || []);
    }

    loadProducts();
  }, []);

  const categories = [
    "All",
    ...new Set(products.map((product) => product.category).filter(Boolean)),
  ];

  const filteredProducts = products.filter((product) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      product.title?.toLowerCase().includes(searchText) ||
      product.description?.toLowerCase().includes(searchText) ||
      product.category?.toLowerCase().includes(searchText) ||
      product.creators?.display_name?.toLowerCase().includes(searchText);

    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold mb-4">Marketplace</h1>

        <p className="text-zinc-400 text-lg mb-8">
          Browse products from creators.
        </p>

        <input
          type="text"
          placeholder="Search products, categories, or creators..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-6"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex flex-wrap gap-3 mb-10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full border ${
                selectedCategory === category
                  ? "bg-white text-black border-white"
                  : "border-zinc-700 text-zinc-300"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <p className="text-zinc-400">No products found.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
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

                <h2 className="text-2xl font-semibold">{product.title}</h2>

                {product.category && (
                  <span className="inline-block mt-3 bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm">
                    {product.category}
                  </span>
                )}

                {product.description && (
                  <p className="text-zinc-400 mt-2">{product.description}</p>
                )}

                <p className="text-2xl font-bold mt-4">{product.price}</p>

                {product.creators && (
                  <Link
                    href={`/creator/${product.creators.username}`}
                    className="block mt-4 text-zinc-400 hover:text-white"
                  >
                    Sold by {product.creators.display_name}
                  </Link>
                )}

                {product.external_url ? (
                  <a
                    href={product.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-4 text-center bg-white text-black py-3 rounded-2xl font-semibold"
                  >
                    Buy Now
                  </a>
                ) : (
                  <button className="mt-4 w-full bg-white text-black py-3 rounded-2xl font-semibold">
                    Buy Now
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}