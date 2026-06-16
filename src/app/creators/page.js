"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import VerifiedBadge from "@/components/VerifiedBadge";

export default function CreatorsPage() {
  const [creators, setCreators] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("All");
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    async function loadCreators() {
      const { data } = await supabase.from("creators").select(`
        *,
        products (
          id,
          is_active
        ),
        followers (
          id
        )
      `);

      setCreators(data || []);
    }

    loadCreators();
  }, []);

  const niches = [
    "All",
    ...new Set(creators.map((creator) => creator.niche).filter(Boolean)),
  ];

  const getActiveProductCount = (creator) =>
    (creator.products || []).filter((product) => product.is_active).length;

  const getFollowerCount = (creator) => (creator.followers || []).length;

  const totalCreators = creators.length;
  const totalProducts = creators.reduce(
    (sum, creator) => sum + getActiveProductCount(creator),
    0
  );
  const totalVerifiedCreators = creators.filter(
    (creator) => creator.is_verified
  ).length;
  const totalCategories = niches.filter((niche) => niche !== "All").length;

  const featuredCreators = creators
    .filter((creator) => creator.is_verified || getFollowerCount(creator) > 0)
    .sort((a, b) => {
      if (Number(b.is_verified) !== Number(a.is_verified)) {
        return Number(b.is_verified) - Number(a.is_verified);
      }

      return getFollowerCount(b) - getFollowerCount(a);
    })
    .slice(0, 3);

  const filteredCreators = creators
    .filter((creator) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        creator.display_name?.toLowerCase().includes(searchText) ||
        creator.username?.toLowerCase().includes(searchText) ||
        creator.bio?.toLowerCase().includes(searchText) ||
        creator.niche?.toLowerCase().includes(searchText);

      const matchesNiche =
        selectedNiche === "All" || creator.niche === selectedNiche;

      const matchesVerified = !showVerifiedOnly || creator.is_verified;

      return matchesSearch && matchesNiche && matchesVerified;
    })
    .sort((a, b) => {
      if (sortBy === "verified") {
        return Number(b.is_verified) - Number(a.is_verified);
      }

      if (sortBy === "products") {
        return getActiveProductCount(b) - getActiveProductCount(a);
      }

      if (sortBy === "followers") {
        return getFollowerCount(b) - getFollowerCount(a);
      }

      return new Date(b.created_at) - new Date(a.created_at);
    });

  function clearFilters() {
    setSearch("");
    setSelectedNiche("All");
    setShowVerifiedOnly(false);
    setSortBy("newest");
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-5 py-8 text-white md:p-10">
      <div className="mx-auto max-w-6xl">
        <section className="mb-5 rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Creator Discovery
              </p>

              <h1 className="mt-1 text-3xl font-bold">
                Explore Creators
              </h1>

              <p className="mt-1 max-w-xl text-sm text-zinc-400">
                Search creator storefronts, products, niches, and communities
                across CreatorsHub.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm">
              <div className="rounded-full border border-zinc-800 bg-zinc-950 px-4 py-2">
                <span className="text-zinc-500">Creators:</span>{" "}
                <span className="font-bold">{totalCreators}</span>
              </div>

              <div className="rounded-full border border-zinc-800 bg-zinc-950 px-4 py-2">
                <span className="text-zinc-500">Products:</span>{" "}
                <span className="font-bold">{totalProducts}</span>
              </div>

              <div className="rounded-full border border-zinc-800 bg-zinc-950 px-4 py-2">
                <span className="text-zinc-500">Verified:</span>{" "}
                <span className="font-bold">{totalVerifiedCreators}</span>
              </div>

              <div className="rounded-full border border-zinc-800 bg-zinc-950 px-4 py-2">
                <span className="text-zinc-500">Niches:</span>{" "}
                <span className="font-bold">{totalCategories}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <input
              type="text"
              placeholder="Search creators, usernames, bios, or niches..."
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 outline-none focus:border-zinc-600"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 outline-none focus:border-zinc-600"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="verified">Verified First</option>
              <option value="products">Most Products</option>
              <option value="followers">Most Followers</option>
            </select>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
              className={`rounded-full border px-4 py-2 text-sm ${
                showVerifiedOnly
                  ? "border-white bg-white text-black"
                  : "border-zinc-700 text-zinc-300 hover:border-white hover:text-white"
              }`}
            >
              Verified Only
            </button>

            {niches.map((niche) => (
              <button
                key={niche}
                onClick={() => setSelectedNiche(niche)}
                className={`rounded-full border px-4 py-2 text-sm ${
                  selectedNiche === niche
                    ? "border-white bg-white text-black"
                    : "border-zinc-700 text-zinc-300 hover:border-white hover:text-white"
                }`}
              >
                {niche}
              </button>
            ))}
          </div>
        </section>

        {featuredCreators.length > 0 && (
          <section className="mb-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-4">
            <div className="mb-4">
              <h2 className="text-xl font-bold">Featured Creators</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Highlighted creators based on verification and audience
                activity.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {featuredCreators.map((creator) => {
                const activeProductCount = getActiveProductCount(creator);
                const followerCount = getFollowerCount(creator);

                return (
                  <Link
                    key={creator.id}
                    href={`/creator/${creator.username}`}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 hover:border-zinc-600"
                  >
                    <div className="flex items-center gap-4">
                      {creator.avatar_url ? (
                        <img
                          src={creator.avatar_url}
                          alt={creator.display_name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-zinc-700" />
                      )}

                      <div className="min-w-0">
                        <h3 className="flex items-center gap-2 font-bold">
                          <span className="truncate">
                            {creator.display_name}
                          </span>
                          {creator.is_verified && <VerifiedBadge />}
                        </h3>

                        <p className="truncate text-sm text-zinc-500">
                          @{creator.username}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                        {followerCount} followers
                      </span>

                      <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                        {activeProductCount} products
                      </span>

                      {creator.niche && (
                        <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                          {creator.niche}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-zinc-400">
            Showing {filteredCreators.length} creator
            {filteredCreators.length === 1 ? "" : "s"}
          </p>

          {(search || selectedNiche !== "All" || showVerifiedOnly) && (
            <button
              onClick={clearFilters}
              className="w-fit text-sm font-semibold text-zinc-400 hover:text-white"
            >
              Clear filters
            </button>
          )}
        </div>

        {filteredCreators.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center">
            <h2 className="text-2xl font-bold">No creators found</h2>

            <p className="mx-auto mt-2 max-w-xl text-zinc-400">
              Try clearing your search, changing the niche filter, or turning
              off Verified Only.
            </p>

            <button
              onClick={clearFilters}
              className="mt-6 rounded-2xl bg-white px-6 py-3 font-semibold text-black hover:bg-zinc-200"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredCreators.map((creator) => {
              const activeProductCount = getActiveProductCount(creator);
              const followerCount = getFollowerCount(creator);

              return (
                <Link
                  key={creator.id}
                  href={`/creator/${creator.username}`}
                  className={`group rounded-3xl border bg-zinc-900 p-5 transition hover:-translate-y-1 hover:border-zinc-700 ${
                    creator.is_verified
                      ? "border-green-900/60"
                      : "border-zinc-800"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {creator.avatar_url ? (
                      <img
                        src={creator.avatar_url}
                        alt={creator.display_name}
                        className="h-16 w-16 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 shrink-0 rounded-full bg-zinc-700" />
                    )}

                    <div className="min-w-0 flex-1">
                      <h2 className="flex items-center gap-2 text-xl font-semibold">
                        <span className="truncate">
                          {creator.display_name}
                        </span>
                        {creator.is_verified && <VerifiedBadge />}
                      </h2>

                      <p className="mt-1 truncate text-sm text-zinc-400">
                        @{creator.username}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                          {followerCount} follower
                          {followerCount === 1 ? "" : "s"}
                        </span>

                        <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                          {activeProductCount} product
                          {activeProductCount === 1 ? "" : "s"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {creator.is_verified && (
                      <p className="text-xs font-semibold uppercase tracking-wide text-green-400">
                        Verified Creator
                      </p>
                    )}

                    {creator.niche && (
                      <span className="inline-block rounded-full bg-zinc-950 px-3 py-1 text-sm text-zinc-400">
                        {creator.niche}
                      </span>
                    )}

                    {creator.bio && (
                      <p className="line-clamp-2 text-sm text-zinc-400">
                        {creator.bio}
                      </p>
                    )}
                  </div>

                  <p className="mt-5 text-sm font-semibold text-zinc-500 transition group-hover:text-white">
                    View storefront →
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}