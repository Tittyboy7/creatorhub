"use client";

import BuyNowButton from "@/components/BuyNowButton";
import AddToCartButton from "@/components/AddToCartButton";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import FavoriteButton from "@/components/FavoriteButton";
import VerifiedBadge from "@/components/VerifiedBadge";

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
            username,
            is_verified
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

    if (sortBy === "mostFavorited") {
      return (b.favorites_count || 0) - (a.favorites_count || 0);
    }

    if (sortBy === "mostReviewed") {
      return (b.reviews_count || 0) - (a.reviews_count || 0);
    }

    if (sortBy === "newest") {
      return (
        new Date(b.created_at || 0) -
        new Date(a.created_at || 0)
      );
    }

    if (sortBy === "creator") {
      return (a.creators?.display_name || "").localeCompare(
        b.creators?.display_name || ""
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
          Explore the Marketplace
        </h1>

        <p className="text-zinc-400 text-lg mb-8 max-w-3xl">
          Discover products, digital downloads, services, memberships, and exclusive offerings from creators across CreatorsHub.
        </p>

        <p className="mb-8 text-sm text-zinc-500">
          Some products may link to creator-owned external checkout pages.
        </p>

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <button
            onClick={() => {
              setSearch("");
              setSelectedCategory("All");
              setSortBy("popular");
            }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-left transition hover:border-zinc-600 hover:bg-zinc-800"
          >
            <p className="text-sm text-zinc-400">Products</p>
            <p className="mt-1 text-2xl font-bold">{products.length}</p>
          </button>

          <button
            onClick={() => setSelectedCategory("All")}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-left transition hover:border-zinc-600 hover:bg-zinc-800"
          >
            <p className="text-sm text-zinc-400">Categories</p>
            <p className="mt-1 text-2xl font-bold">{categories.length - 1}</p>
          </button>

          <button
            onClick={() => {
              setSearch("");
              setSelectedCategory("All");
            }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-left transition hover:border-zinc-600 hover:bg-zinc-800"
          >
            <p className="text-sm text-zinc-400">Results</p>
            <p className="mt-1 text-2xl font-bold">{sortedProducts.length}</p>
          </button>

          <button
            onClick={() => setSortBy("popular")}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-left transition hover:border-zinc-600 hover:bg-zinc-800"
          >
            <p className="text-sm text-zinc-400">Sort</p>
            <p className="mt-1 text-sm font-semibold text-zinc-300">
              {sortBy === "popular"
                ? "Most Popular"
                : sortBy === "highestRated"
                ? "Highest Rated"
                : sortBy === "mostViewed"
                ? "Most Viewed"
                : sortBy === "mostFavorited"
                ? "Most Favorited"
                : sortBy === "mostReviewed"
                ? "Most Reviewed"
                : sortBy === "creator"
                ? "Creator A-Z"
                : "Newest"}
            </p>
          </button>
        </div>

        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Search and sort products
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
            <option value="newest">Newest</option>
            <option value="highestRated">Highest Rated</option>
            <option value="mostReviewed">Most Reviewed</option>
            <option value="mostFavorited">Most Favorited</option>
            <option value="mostViewed">Most Viewed</option>
            <option value="creator">Creator A-Z</option>
          </select>
        </div>

        <div className="mb-3 flex items-center justify-between gap-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Browse by category
          </p>

          {selectedCategory !== "All" && (
            <p className="text-sm text-zinc-500">
              Selected: {selectedCategory}
            </p>
          )}
        </div>

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
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-zinc-400">
              Showing {sortedProducts.length} of {products.length} product
              {products.length === 1 ? "" : "s"}
            </p>

            {(search || selectedCategory !== "All") && (
              <p className="mt-1 text-sm text-zinc-500">
                Filters active
                {search ? ` · Search: "${search}"` : ""}
                {selectedCategory !== "All" ? ` · Category: ${selectedCategory}` : ""}
              </p>
            )}
          </div>

          {(search || selectedCategory !== "All") && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("All");
                setSortBy("popular");
              }}
              className="w-fit text-sm font-semibold text-zinc-400 hover:text-white"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="mb-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-zinc-800" />

          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
            Products
          </p>

          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        {sortedProducts.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center">
            <h2 className="text-2xl font-bold">No products found</h2>

            <p className="mx-auto mt-2 max-w-xl text-zinc-400">
              Try clearing your search or choosing another category. If no products are available yet, explore creators and check back as new storefronts are added.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("All");
                  setSortBy("popular");
                }}
                className="rounded-2xl bg-white px-6 py-3 font-semibold text-black hover:bg-zinc-200"
              >
                Clear Filters
              </button>

              <Link
                href="/creators"
                className="rounded-2xl border border-zinc-700 px-6 py-3 font-semibold text-zinc-300 hover:bg-zinc-800"
              >
                Discover Creators
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
            {sortedProducts.map((product) => (
              <div
                key={product.id}
                className="group flex h-full flex-col rounded-3xl border border-zinc-800 bg-zinc-900 p-4 transition duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:shadow-2xl md:p-6"
              >
                <Link href={`/product/${product.id}`} className="flex flex-1 flex-col">

                <div className="relative mb-4"></div>

                  <div className="relative mb-4">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="h-32 w-full rounded-2xl object-cover transition duration-300 group-hover:scale-[1.02] md:h-48"
                      />
                    ) : (
                      <div className="flex h-32 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-500 md:h-48">
                        Product Image
                      </div>
                    )}

                    {((product.views || 0) +
                      (product.favorites_count || 0) +
                      (product.reviews_count || 0)) >= 100 && (
                      <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/70 px-3 py-1 text-xs font-semibold text-white shadow-lg backdrop-blur">
                        Trending
                      </span>
                    )}
                  </div>
                 
                  <h3 className="line-clamp-2 text-xl font-semibold group-hover:text-zinc-300 md:text-2xl">
                    {product.title}
                  </h3>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                    {product.category && <span>{product.category}</span>}

                    {product.category && product.reviews_count > 0 && <span>•</span>}

                    {product.reviews_count > 0 && (
                      <>
                        <span>⭐ {Number(product.average_rating).toFixed(1)}</span>
                        <span>•</span>
                        <span>
                          {product.reviews_count} review
                          {product.reviews_count === 1 ? "" : "s"}
                        </span>
                      </>
                    )}
                  </div>

                  <p className="mt-3 line-clamp-2 min-h-[2.5rem] text-sm text-zinc-400">
                    {product.description || "View this product for more details."}
                  </p>

                  <p className="mt-4 text-2xl font-bold md:text-3xl">
                    {formatCurrency(product.price)}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                      👁 {product.views || 0} views
                    </span>

                    <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                      ❤ {product.favorites_count || 0} favorites
                    </span>
                  </div>

                  {product.creators && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
                      <span>Creator</span>

                      <span className="line-clamp-1 font-semibold text-zinc-300">
                        {product.creators.display_name}
                      </span>

                      {product.creators.is_verified && <VerifiedBadge />}
                    </div>
                  )}

                  <div className="mt-auto pt-5">
                    <p className="rounded-2xl border border-zinc-800 px-4 py-3 text-center text-sm font-semibold text-zinc-300 transition group-hover:border-zinc-600 group-hover:bg-zinc-800 group-hover:text-white">
                      View Product →
                    </p>
                  </div>
                </Link>

                <div className="mt-auto space-y-3 pt-5">
                  <BuyNowButton
                    productId={product.id}
                    externalUrl={product.external_url}
                  />

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <FavoriteButton productId={product.id} />

                      <AddToCartButton productId={product.id} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}