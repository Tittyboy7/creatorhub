"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/formatDate";

export default function AdminAnnouncementsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadAnnouncements() {
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
        .from("announcements")
        .select(`
          *,
          creators (
            display_name,
            username
          ),
          products (
            id,
            title
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        alert(error.message);
      } else {
        setAnnouncements(data || []);
      }

      setLoading(false);
    }

    loadAnnouncements();
  }, [router]);

  async function handleToggleAnnouncement(announcement) {
    const { error } = await supabase
      .from("announcements")
      .update({
        is_active: !announcement.is_active,
      })
      .eq("id", announcement.id);

    if (error) {
      alert(error.message);
      return;
    }

    setAnnouncements((currentAnnouncements) =>
      currentAnnouncements.map((currentAnnouncement) =>
        currentAnnouncement.id === announcement.id
          ? {
              ...currentAnnouncement,
              is_active: !currentAnnouncement.is_active,
            }
          : currentAnnouncement
      )
    );
  }

  const filteredAnnouncements = announcements.filter((announcement) => {
    const searchText = search.toLowerCase();

    return (
      announcement.title?.toLowerCase().includes(searchText) ||
      announcement.content?.toLowerCase().includes(searchText) ||
      announcement.creators?.display_name
        ?.toLowerCase()
        .includes(searchText) ||
      announcement.products?.title
        ?.toLowerCase()
        .includes(searchText) ||
      (searchText === "hidden" && !announcement.is_active)
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

        <h1 className="text-5xl font-bold mb-4">
          Admin Announcements
        </h1>

        <p className="text-zinc-400 text-lg mb-8">
          Review all creator announcements.
        </p>

        <input
          type="text"
          placeholder="Search announcements, creators, products, hidden..."
          className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4 mb-6"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <p className="text-zinc-400 mb-6">
          Showing {filteredAnnouncements.length} announcement
          {filteredAnnouncements.length === 1 ? "" : "s"}
        </p>

        {filteredAnnouncements.length === 0 ? (
          <p className="text-zinc-400">No announcements found.</p>
        ) : (
          <div className="space-y-6">
            {filteredAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className={`bg-zinc-900 border rounded-3xl p-6 ${
                  announcement.is_active
                    ? "border-zinc-800"
                    : "border-red-900 opacity-70"
                }`}
              >
                <h2 className="text-2xl font-semibold">
                  {announcement.title}
                </h2>

                <p className="text-zinc-500 text-sm mt-1">
                  {formatDate(announcement.created_at)}
                </p>

                {!announcement.is_active && (
                  <span className="inline-block mt-3 bg-red-950 text-red-400 px-3 py-1 rounded-full text-sm">
                    Hidden
                  </span>
                )}

                {announcement.creators && (
                  <Link
                    href={`/creator/${announcement.creators.username}`}
                    className="block mt-3 text-zinc-400 hover:text-white"
                  >
                    Posted by {announcement.creators.display_name}
                  </Link>
                )}

                {announcement.content && (
                  <p className="text-zinc-400 mt-4">
                    {announcement.content}
                  </p>
                )}

                {announcement.products && (
                  <>
                    <span className="inline-block mt-4 bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm">
                      Linked Product
                    </span>

                    <Link
                      href={`/product/${announcement.products.id}`}
                      className="block mt-3 text-zinc-400 hover:text-white"
                    >
                      View Product: {announcement.products.title}
                    </Link>
                  </>
                )}

                <div className="mt-5 space-y-3">
                  <button
                    onClick={() => handleToggleAnnouncement(announcement)}
                    className={`w-full py-3 rounded-2xl font-semibold flex items-center justify-center ${
                      announcement.is_active
                        ? "border border-red-900 text-red-400 hover:bg-red-950"
                        : "bg-white text-black"
                    }`}
                  >
                    {announcement.is_active
                      ? "Hide Announcement"
                      : "Restore Announcement"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}