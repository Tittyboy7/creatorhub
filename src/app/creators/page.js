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
      const { data } = await supabase
        .from("creators")
        .select(`
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

  return (
    <div className="min-h-screen bg-zinc-950 px-5 py-8 text-white md:p-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-4 text-5xl font-bold">Explore Creators</h1>

        <p className="mb-8 text-lg text-zinc-400">
          Discover creator businesses, storefronts, products, announcements,
          and communities across CreatorsHub.
        </p>

        <div className="mb-6 grid gap-3 md:grid-cols-[1fr_220px]">
          <input
            type="text"
            placeholder="Search creators, usernames, bios, or niches..."
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="verified">Verified First</option>
            <option value="products">Most Products</option>
            <option value="followers">Most Followers</option>
          </select>
        </div>

        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Filter creators
        </p>

        <div className="mb-10 flex flex-wrap gap-3">
          <button
            onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
            className={`rounded-full border px-4 py-2 ${
              showVerifiedOnly
                ? "border-white bg-white text-black"
                : "border-zinc-700 text-zinc-300"
            }`}
          >
            Verified Only
          </button>

          {niches.map((niche) => (
            <button
              key={niche}
              onClick={() => setSelectedNiche(niche)}
              className={`rounded-full border px-4 py-2 ${
                selectedNiche === niche
                  ? "border-white bg-white text-black"
                  : "border-zinc-700 text-zinc-300"
              }`}
            >
              {niche}
            </button>
          ))}
        </div>

        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-zinc-400">
            Showing {filteredCreators.length} creator
            {filteredCreators.length === 1 ? "" : "s"}
          </p>

          {(search || selectedNiche !== "All" || showVerifiedOnly) && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedNiche("All");
                setShowVerifiedOnly(false);
              }}
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
              Try clearing your search, changing the niche filter, or turning off Verified Only.
            </p>

            <button
              onClick={() => {
                setSearch("");
                setSelectedNiche("All");
                setShowVerifiedOnly(false);
                setSortBy("newest");
              }}
              className="mt-6 rounded-2xl bg-white px-6 py-3 font-semibold text-black hover:bg-zinc-200"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
            {filteredCreators.map((creator) => {
              const activeProductCount = getActiveProductCount(creator);
              const followerCount = getFollowerCount(creator);

              return (
                <Link
                  key={creator.id}
                  href={`/creator/${creator.username}`}
                  className={`group flex h-full flex-col overflow-hidden rounded-3xl border bg-zinc-900 transition duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:shadow-2xl ${
                    creator.is_verified
                      ? "border-green-900/60"
                      : "border-zinc-800"
                  }`}
                >
                  {creator.banner_url ? (
                    <img
                      src={creator.banner_url}
                      alt={creator.display_name}
                      className="h-24 w-full object-cover transition duration-300 group-hover:scale-[1.02] md:h-36"
                    />
                  ) : (
                    <div className="h-24 bg-gradient-to-br from-zinc-800 to-zinc-900 md:h-36" />
                  )}

                  <div className="flex flex-1 flex-col p-4 md:p-6">
                    {creator.avatar_url ? (
                      <img
                        src={creator.avatar_url}
                        alt={creator.display_name}
                        className="relative z-10 -mt-14 mb-4 h-20 w-20 rounded-full border-4 border-zinc-900 object-cover md:-mt-16"
                      />
                    ) : (
                      <div className="relative z-10 -mt-14 mb-4 h-20 w-20 rounded-full border-4 border-zinc-900 bg-zinc-700 md:-mt-16" />
                    )}

                    <h2 className="flex items-center gap-2 text-lg font-semibold md:text-2xl">
                      <span className="line-clamp-1">
                        {creator.display_name}
                      </span>

                      {creator.is_verified && <VerifiedBadge />}
                    </h2>

                    <p className="mt-1 line-clamp-1 text-sm text-zinc-400">
                      @{creator.username}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                        {followerCount} follower
                        {followerCount === 1 ? "" : "s"}
                      </span>

                      <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                        {activeProductCount} product
                        {activeProductCount === 1 ? "" : "s"}
                      </span>
                    </div>

                    {creator.is_verified && (
                      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-green-400">
                        Verified Creator
                      </p>
                    )}

                    {creator.niche && (
                      <span className="mt-3 inline-block rounded-full bg-zinc-950 px-3 py-1 text-sm text-zinc-400">
                        {creator.niche}
                      </span>
                    )}

                    {creator.bio && (
                      <p className="mt-3 line-clamp-2 text-sm text-zinc-400">
                        {creator.bio}
                      </p>
                    )}

                    <p className="mt-auto pt-5 text-sm font-semibold text-zinc-500 transition group-hover:text-white">
                      View storefront →
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}