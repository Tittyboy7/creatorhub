"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CreatorsPage() {
  const [creators, setCreators] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("All");

  useEffect(() => {
    async function loadCreators() {
      const { data } = await supabase.from("creators").select("*");
      setCreators(data || []);
    }

    loadCreators();
  }, []);

  const niches = [
    "All",
    ...new Set(creators.map((creator) => creator.niche).filter(Boolean)),
  ];

  const filteredCreators = creators.filter((creator) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      creator.display_name?.toLowerCase().includes(searchText) ||
      creator.username?.toLowerCase().includes(searchText) ||
      creator.bio?.toLowerCase().includes(searchText) ||
      creator.niche?.toLowerCase().includes(searchText);

    const matchesNiche =
      selectedNiche === "All" || creator.niche === selectedNiche;

    return matchesSearch && matchesNiche;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold mb-4">Creators</h1>

        <p className="text-zinc-400 text-lg mb-8">
          Discover creators, storefronts, products, and social links.
        </p>

        <input
          type="text"
          placeholder="Search creators, usernames, bios, or niches..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-6"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex flex-wrap gap-3 mb-10">
          {niches.map((niche) => (
            <button
              key={niche}
              onClick={() => setSelectedNiche(niche)}
              className={`px-4 py-2 rounded-full border ${
                selectedNiche === niche
                  ? "bg-white text-black border-white"
                  : "border-zinc-700 text-zinc-300"
              }`}
            >
              {niche}
            </button>
          ))}
        </div>

        {filteredCreators.length === 0 ? (
          <p className="text-zinc-400">No creators found.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {filteredCreators.map((creator) => (
              <Link
                key={creator.id}
                href={`/creator/${creator.username}`}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden hover:border-zinc-600 transition"
              >
                {creator.banner_url ? (
                  <img
                    src={creator.banner_url}
                    alt={creator.display_name}
                    className="h-32 w-full object-cover"
                  />
                ) : (
                  <div className="h-32 bg-zinc-800" />
                )}

                <div className="p-6">
                  {creator.avatar_url ? (
                    <img
                      src={creator.avatar_url}
                      alt={creator.display_name}
                      className="w-20 h-20 object-cover rounded-full -mt-16 mb-4 border-4 border-zinc-900"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-zinc-700 -mt-16 mb-4 border-4 border-zinc-900" />
                  )}

                  <h2 className="text-2xl font-semibold">
                    {creator.display_name}
                  </h2>

                  <p className="text-zinc-400 mt-1">@{creator.username}</p>

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
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}