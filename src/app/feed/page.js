"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/formatDate";
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

export default function FeedPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [feedItems, setFeedItems] = useState([]);
  const [filter, setFilter] = useState("All");

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
            avatar_url,
            is_verified
          ),
          products (
            id,
            title
          )
        `)
        .in("creator_id", creatorIds)
        .eq("is_active", true)
        .eq("admin_hidden", false);

      const { data: products } = await supabase
        .from("products")
        .select(`
          *,
          creators (
            display_name,
            username,
            avatar_url,
            is_verified
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

  const filteredFeedItems = feedItems.filter((item) => {
    if (filter === "Announcements") return item.type === "announcement";
    if (filter === "Products") return item.type === "product";
    return true;
  });

    return (
    <div className="min-h-screen bg-zinc-950 px-5 py-8 text-white md:p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="mb-4 text-4xl font-bold md:text-5xl">Your Creator Feed</h1>

        <p className="mb-4 text-lg text-zinc-400">
          Follow creator announcements, product drops, and new releases from the creators you care about.
        </p>

        <p className="mb-6 text-sm text-zinc-500">
          Your feed is personalized based on the creators you follow.
        </p>

        <div className="mb-6 grid grid-cols-3 gap-3">
          <button
            onClick={() => setFilter("All")}
            className={`rounded-2xl border p-4 text-left transition ${
              filter === "All"
                ? "border-white bg-zinc-800"
                : "border-zinc-800 bg-zinc-900 hover:border-zinc-600 hover:bg-zinc-800"
            }`}
          >
            <p className="text-xs text-zinc-500">All</p>
            <p className="mt-1 text-2xl font-bold">{feedItems.length}</p>
          </button>

          <button
            onClick={() => setFilter("Announcements")}
            className={`rounded-2xl border p-4 text-left transition ${
              filter === "Announcements"
                ? "border-white bg-zinc-800"
                : "border-zinc-800 bg-zinc-900 hover:border-zinc-600 hover:bg-zinc-800"
            }`}
          >
            <p className="text-xs text-zinc-500">Announcements</p>
            <p className="mt-1 text-2xl font-bold">
              {feedItems.filter((item) => item.type === "announcement").length}
            </p>
          </button>

          <button
            onClick={() => setFilter("Products")}
            className={`rounded-2xl border p-4 text-left transition ${
              filter === "Products"
                ? "border-white bg-zinc-800"
                : "border-zinc-800 bg-zinc-900 hover:border-zinc-600 hover:bg-zinc-800"
            }`}
          >
            <p className="text-xs text-zinc-500">Products</p>
            <p className="mt-1 text-2xl font-bold">
              {feedItems.filter((item) => item.type === "product").length}
            </p>
          </button>
        </div>

        <p className="mb-4 text-zinc-400">
          Showing {filteredFeedItems.length} feed item
          {filteredFeedItems.length === 1 ? "" : "s"}
        </p>

        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Filter feed
        </p>

        <div className="mb-8 flex flex-wrap items-center gap-3">
          {["All", "Announcements", "Products"].map((option) => (
            <button
              key={option}
              onClick={() => setFilter(option)}
              className={`rounded-full border px-4 py-2 ${
                filter === option
                  ? "border-white bg-white text-black"
                  : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              {option}
            </button>
          ))}

          {filter !== "All" && (
            <button
              onClick={() => setFilter("All")}
              className="text-sm font-semibold text-zinc-400 hover:text-white"
            >
              Clear filter
            </button>
          )}
        </div>

        {filteredFeedItems.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center">
            <h2 className="text-2xl font-bold">Your feed is empty</h2>

            <p className="mx-auto mt-2 max-w-xl text-zinc-400">
              {filter === "All"
                ? "Follow creators to see their announcements, product drops, and new releases here."
                : `No ${filter.toLowerCase()} found from creators you follow yet.`}
            </p>

            <Link
              href="/creators"
              className="mt-6 inline-block rounded-2xl bg-white px-6 py-3 font-semibold text-black hover:bg-zinc-200"
            >
              Discover Creators
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredFeedItems.map((item, index) => {
              const data = item.data;
              const creator = data.creators;

              return (
                <div
                  key={`${item.type}-${data.id}-${index}`}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
                >
                  {creator && (
                    <Link
                      href={`/creator/${creator.username}`}
                      className="mb-4 flex items-center gap-3"
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
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">
                            {creator.display_name}
                          </p>

                          {creator.is_verified && <VerifiedBadge />}
                        </div>

                        <p className="text-sm text-zinc-500">
                          @{creator.username} • {formatDate(data.created_at)}
                        </p>
                      </div>
                    </Link>
                  )}

                  <div className="mb-4 border-t border-zinc-800" />

                  {item.type === "announcement" ? (
                    <>
                      <span className="mb-3 inline-block rounded-full bg-blue-950 px-3 py-1 text-sm text-blue-400">
                        Announcement
                      </span>

                      <h2 className="text-xl font-semibold">
                        {data.title}
                      </h2>
                      
                      {data.content && (
                        <p className="text-zinc-400 mt-3">
                          {data.content}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-3">
                        {creator && (
                          <Link
                            href={`/creator/${creator.username}`}
                            className="rounded-2xl border border-zinc-700 px-5 py-3 text-sm font-semibold hover:bg-zinc-800"
                          >
                            Visit Creator Page
                          </Link>
                        )}

                        {data.products && (
                          <Link
                            href={`/product/${data.products.id}`}
                            className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-zinc-200"
                          >
                            View Product
                          </Link>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="mb-3 inline-block rounded-full bg-green-950 px-3 py-1 text-sm text-green-400">
                        New Product
                      </span>

                      {data.image_url && (
                        <img
                          src={data.image_url}
                          alt={data.title}
                          className="mb-4 h-40 w-full rounded-2xl object-cover"
                        />
                      )}

                      <Link
                        href={`/product/${data.id}`}
                        className="block text-xl font-semibold hover:text-zinc-300"
                      >
                        {data.title}
                      </Link>

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
                        {formatCurrency(data.price)}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <Link
                          href={`/product/${data.id}`}
                          className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-zinc-200"
                        >
                          View Product
                        </Link>

                        {creator && (
                          <Link
                            href={`/creator/${creator.username}`}
                            className="rounded-2xl border border-zinc-700 px-5 py-3 text-sm font-semibold hover:bg-zinc-800"
                          >
                            Visit Creator Page
                          </Link>
                        )}
                      </div>
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