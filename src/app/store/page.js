"use client";

import BuyNowButton from "@/components/BuyNowButton";
import AddToCartButton from "@/components/AddToCartButton";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import FavoriteButton from "@/components/FavoriteButton";

export default function StorePage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("popular");

  useEffect(() => {
    async function loadProducts() {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          creators (
            display_name,
            username
          )
        `)
        .eq("is_active", true);

      if (error) {
        console.log(error);
      }

      setProducts(data || []);
    }

    loadProducts();
  }, []);

  const categories = [
    "All",
    ...new Set(
      products
        .map((product) => product.category)
        .filter(Boolean)
    ),
  ];

  const filteredProducts = products.filter((product) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      product.title?.toLowerCase().includes(searchText) ||
      product.description?.toLowerCase().includes(searchText) ||
      product.category?.toLowerCase().includes(searchText) ||
      product.creators?.display_name
        ?.toLowerCase()
        .includes(searchText);

    const matchesCategory =
      selectedCategory === "All" ||
      product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "highestRated") {
      return (b.average_rating || 0) - (a.average_rating || 0);
    }

    if (sortBy === "mostViewed") {
      return (b.views || 0) - (a.views || 0);
    }

    if (sortBy === "newest") {
      return (
        new Date(b.created_at || 0) -
        new Date(a.created_at || 0)
      );
    }

    return (
      (b.views || 0) +
      (b.favorites_count || 0) +
      (b.reviews_count || 0) -
      (
        (a.views || 0) +
        (a.favorites_count || 0) +
        (a.reviews_count || 0)
      )
    );
  });
    return (
    <div className="min-h-screen bg-zinc-950 text-white px-5 py-8 md:p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold mb-4">
          Marketplace
        </h1>

        <p className="text-zinc-400 text-lg mb-8">
          Browse products from creators.
        </p>

        <div className="grid md:grid-cols-[1fr_240px] gap-4 mb-6">
          <input
            type="text"
            placeholder="Search products, categories, or creators..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="popular">Most Popular</option>
            <option value="highestRated">Highest Rated</option>
            <option value="mostViewed">Most Viewed</option>
            <option value="newest">Newest</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-3 mb-10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() =>
                setSelectedCategory(category)
              }
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
        <p className="text-zinc-400 mb-6">
          Showing {sortedProducts.length} product
          {sortedProducts.length === 1 ? "" : "s"}
        </p>

        {sortedProducts.length === 0 ? (
          <div>
            <p className="text-zinc-400">
              No products found.
            </p>

            <Link
              href="/creators"
              className="inline-block mt-6 bg-white text-black px-6 py-3 rounded-2xl font-semibold"
            >
              Discover Creators
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {sortedProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-zinc-900 border border-zinc-800 rounded-3xl p-6 transition duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:shadow-2xl"
              >
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="h-48 w-full object-cover rounded-2xl mb-4 transition duration-300 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="h-40 bg-zinc-800 rounded-2xl mb-4 flex items-center justify-center text-zinc-500">
                    Product Image
                  </div>
                )}

                <Link
                  href={`/product/${product.id}`}
                  className="block text-2xl font-semibold hover:text-zinc-300 underline-offset-4 hover:underline"
                >
                  {product.title}
                </Link>

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

                {product.reviews_count > 0 && (
                  <p className="text-zinc-500 mt-2">
                    ⭐ {Number(product.average_rating).toFixed(1)} / 5 ·{" "}
                    {product.reviews_count} review
                    {product.reviews_count === 1 ? "" : "s"}
                  </p>
                )}

                <p className="text-zinc-500 mt-2">
                  {product.views || 0} views ·{" "}
                  {product.favorites_count || 0} favorites
                </p>

                {product.creators && (
                  <Link
                    href={`/creator/${product.creators.username}`}
                    className="block mt-4 text-zinc-400 hover:text-white"
                  >
                    Sold by {product.creators.display_name}
                  </Link>
                )}

                <div className="mt-5 space-y-3">
                  <BuyNowButton
                    productId={product.id}
                    externalUrl={product.external_url}
                  />

                  <FavoriteButton
                    productId={product.id}
                  />

                  <AddToCartButton
                    productId={product.id}
                  />
                </div>
              </div>            
            ))}
          </div>
        )}
      </div>
    </div>
  );
}