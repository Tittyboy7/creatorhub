"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function FollowingPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    async function loadFollowing() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("followers")
        .select(`
          id,
          creators (
            id,
            display_name,
            username,
            bio,
            avatar_url,
            banner_url
          )
        `)
        .eq("user_id", user.id);

      if (error) {
        alert(error.message);
      } else {
        setFollowing(data || []);
      }

      setLoading(false);
    }

    loadFollowing();
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
        <h1 className="text-5xl font-bold mb-4">Following</h1>

        <p className="text-zinc-400 text-lg mb-10">
          Creators you follow.
        </p>

        {following.length === 0 ? (
          <p className="text-zinc-400">You are not following any creators yet.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {following.map((item) => {
              const creator = item.creators;

              if (!creator) return null;

              return (
                <Link
                  key={item.id}
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

                    <p className="text-zinc-400 mt-1">
                      @{creator.username}
                    </p>

                    {creator.bio && (
                      <p className="text-zinc-400 mt-4 line-clamp-2">
                        {creator.bio}
                      </p>
                    )}
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