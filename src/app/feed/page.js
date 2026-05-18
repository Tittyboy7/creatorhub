"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/formatDate";

export default function FeedPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [feedItems, setFeedItems] = useState([]);

  useEffect(() => {
    async function loadFeed() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: following } = await supabase
        .from("followers")
        .select("creator_id")
        .eq("user_id", user.id);

      const creatorIds = (following || []).map((item) => item.creator_id);

      if (creatorIds.length === 0) {
        setFeedItems([]);
        setLoading(false);
        return;
      }

      const { data: announcements } = await supabase
        .from("announcements")
        .select(`
          *,
          creators (
            display_name,
            username,
            avatar_url
          ),
          products (
            id,
            title
          )
        `)
        .in("creator_id", creatorIds)
        .eq("is_active", true);

      const { data: products } = await supabase
        .from("products")
        .select(`
          *,
          creators (
            display_name,
            username,
            avatar_url
          )
        `)
        .in("creator_id", creatorIds)
        .eq("is_active", true);

      const announcementItems = (announcements || []).map((announcement) => ({
        type: "announcement",
        created_at: announcement.created_at,
        data: announcement,
      }));

      const productItems = (products || []).map((product) => ({
        type: "product",
        created_at: product.created_at,
        data: product,
      }));

      const combinedItems = [...announcementItems, ...productItems].sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
      );

      setFeedItems(combinedItems);
      setLoading(false);
    }

    loadFeed();
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-4">Feed</h1>

        <p className="text-zinc-400 text-lg mb-10">
          Announcements and new products from creators you follow.
        </p>

        {feedItems.length === 0 ? (
          <p className="text-zinc-400">
            No updates from followed creators yet.
          </p>
        ) : (
          <div className="space-y-6">
            {feedItems.map((item, index) => {
              const data = item.data;
              const creator = data.creators;

              return (
                <div
                  key={`${item.type}-${data.id}-${index}`}
                  className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6"
                >
                  {creator && (
                    <Link
                      href={`/creator/${creator.username}`}
                      className="flex items-center gap-3 mb-4"
                    >
                      {creator.avatar_url ? (
                        <img
                          src={creator.avatar_url}
                          alt={creator.display_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-zinc-700" />
                      )}

                      <div>
                        <p className="font-semibold">
                          {creator.display_name}
                        </p>
                        <p className="text-zinc-500 text-sm">
                          @{creator.username}
                        </p>                        
                      </div>
                    </Link>
                  )}

                  {item.type === "announcement" ? (
                    <>
                      <span className="inline-block mb-3 bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm">
                        Announcement
                      </span>

                      <h2 className="text-2xl font-semibold">
                        {data.title}
                      </h2>

                      {creator && (
                        <Link
                          href={`/creator/${creator.username}`}
                          className="block mt-2 text-zinc-400 hover:text-white"
                        >
                          View {creator.display_name}'s storefront
                        </Link>
                      )}

                      {data.content && (
                        <p className="text-zinc-400 mt-3">
                          {data.content}
                        </p>
                      )}

                      {data.products && (
                        <>
                          <span className="inline-block mt-4 bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm">
                            Linked Product
                          </span>

                          <Link
                            href={`/product/${data.products.id}`}
                            className="inline-block mt-4 bg-white text-black px-5 py-3 rounded-2xl font-semibold"
                          >
                            View Product: {data.products.title}
                          </Link>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="inline-block mb-3 bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm">
                        New Product
                      </span>

                        <p className="text-zinc-500 text-sm mb-3">
                          {formatDate(data.created_at)}
                        </p>

                      {data.image_url && (
                        <img
                          src={data.image_url}
                          alt={data.title}
                          className="h-56 w-full object-cover rounded-2xl mb-4"
                        />
                      )}

                      <Link
                        href={`/product/${data.id}`}
                        className="block text-2xl font-semibold hover:text-zinc-300"
                      >
                        {data.title}
                      </Link>

                      {creator && (
                        <Link
                          href={`/creator/${creator.username}`}
                          className="block mt-2 text-zinc-400 hover:text-white"
                        >
                          View {creator.display_name}'s storefront
                        </Link>
                      )}

                      {data.category && (
                        <span className="inline-block mt-3 bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm">
                          {data.category}
                        </span>
                      )}

                      {data.description && (
                        <p className="text-zinc-400 mt-3">
                          {data.description}
                        </p>
                      )}

                      <p className="text-2xl font-bold mt-4">
                        {data.price}
                      </p>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}