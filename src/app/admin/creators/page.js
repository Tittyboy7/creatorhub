"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import products from "@/data/products";

export default function AdminCreatorsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [creators, setCreators] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadCreators() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (!profile?.is_admin) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);

      const { data, error } = await supabase
        .from("creators")
        .select(`
          *,
          products (
            id
          ),
          followers (
            id
          )
        `)
        .order("display_name", { ascending: true });

      if (error) {
        alert(error.message);
      } else {
        setCreators(data || []);
      }

      setLoading(false);
    }

    loadCreators();
  }, [router]);

  const filteredCreators = creators.filter((creator) => {
    const searchText = search.toLowerCase();

    return (
      creator.display_name?.toLowerCase().includes(searchText) ||
      creator.username?.toLowerCase().includes(searchText) ||
      creator.niche?.toLowerCase().includes(searchText)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-10">
        <h1 className="text-4xl font-bold">Access denied</h1>
        <p className="text-zinc-400 mt-4">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-10">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/admin"
          className="inline-block mb-8 border border-zinc-700 px-5 py-3 rounded-2xl hover:bg-zinc-800"
        >
          Back to Admin
        </Link>

        <h1 className="text-5xl font-bold mb-4">Admin Creators</h1>

        <p className="text-zinc-400 text-lg mb-8">
          Review all creator profiles and storefronts.
        </p>

        <input
          type="text"
          placeholder="Search creators..."
          className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4 mb-6"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <p className="text-zinc-400 mb-6">
          Showing {filteredCreators.length} creator
          {filteredCreators.length === 1 ? "" : "s"}
        </p>

        {filteredCreators.length === 0 ? (
          <p className="text-zinc-400">No creators found.</p>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCreators.map((creator) => (
              <div
                key={creator.id}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden"
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

                  <p className="text-zinc-400 mt-1">
                    @{creator.username}
                  </p>

                  <p className="text-zinc-500 mt-2">
                    {(creator.products || []).length} product
                    {(creator.products || []).length === 1 ? "" : "s"}
                  </p>

                  <p className="text-zinc-500 mt-1">
                    {(creator.followers || []).length} follower
                    {(creator.followers || []).length === 1 ? "" : "s"}
                  </p>

                  {creator.niche && (
                    <span className="inline-block mt-3 bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm">
                      {creator.niche}
                    </span>
                  )}

                  {creator.bio && (
                    <p className="text-zinc-400 mt-4 line-clamp-3">
                      {creator.bio}
                    </p>
                  )}

                  <div className="mt-5 space-y-3">
                    <Link
                      href={`/creator/${creator.username}`}
                      className="w-full bg-white text-black py-3 rounded-2xl font-semibold flex items-center justify-center"
                    >
                      View Storefront
                    </Link>
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