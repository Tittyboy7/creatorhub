"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/formatDate";

export default function DashboardAnnouncementsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [creator, setCreator] = useState(null);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    async function loadAnnouncements() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: creatorData } = await supabase
        .from("creators")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!creatorData) {
        router.push("/create-profile");
        return;
      }

      setCreator(creatorData);

      const { data, error } = await supabase
        .from("announcements")
        .select(`
          *,
          products (
            id,
            title
          )
        `)
        .eq("creator_id", creatorData.id)
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

  async function handleToggleAnnouncementActive(announcement) {
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
              is_active: !announcement.is_active,
            }
          : currentAnnouncement
      )
    );
  }

  async function handleDeleteAnnouncement(announcementId) {
    const confirmed = confirm(
      "Are you sure you want to permanently delete this announcement?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", announcementId);

    if (error) {
      alert(error.message);
      return;
    }

    setAnnouncements((currentAnnouncements) =>
      currentAnnouncements.filter(
        (announcement) => announcement.id !== announcementId
      )
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-5 py-8 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold">
              Announcement Management
            </h1>

            <p className="text-zinc-400 mt-3">
              Manage announcements for {creator?.display_name}.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="border border-zinc-700 px-5 py-3 rounded-2xl hover:bg-zinc-800 transition"
            >
              Back to Dashboard
            </Link>

            <Link
              href="/add-announcement"
              className="bg-white text-black px-5 py-3 rounded-2xl font-semibold hover:bg-zinc-200 transition"
            >
              Add Announcement
            </Link>
          </div>
        </div>

        {announcements.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-3">
              No announcements yet
            </h2>

            <p className="text-zinc-400 mb-6">
              Share updates with your followers and storefront visitors.
            </p>

            <Link
              href="/add-announcement"
              className="inline-block bg-white text-black px-6 py-3 rounded-2xl font-semibold hover:bg-zinc-200 transition"
            >
              Add Announcement
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className={`bg-zinc-900 border rounded-3xl p-6 ${
                  announcement.is_active
                    ? "border-zinc-800"
                    : "border-red-900 opacity-80"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold">
                      {announcement.title}
                    </h2>

                    <p className="text-zinc-500 text-sm mt-1">
                      {formatDate(announcement.created_at)}
                    </p>
                  </div>

                  {!announcement.is_active && (
                    <span className="bg-red-950 text-red-400 px-3 py-1 rounded-full text-sm w-fit">
                      Hidden
                    </span>
                  )}
                </div>

                {announcement.products && (
                  <span className="inline-block mt-4 bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm">
                    Linked Product
                  </span>
                )}

                {announcement.content && (
                  <p className="text-zinc-400 mt-4 whitespace-pre-wrap">
                    {announcement.content}
                  </p>
                )}

                {announcement.products && (
                  <Link
                    href={`/product/${announcement.products.id}`}
                    className="inline-block mt-4 text-zinc-400 hover:text-white"
                  >
                    Linked product: {announcement.products.title}
                  </Link>
                )}

                <div className="flex flex-wrap gap-3 mt-6">
                  <Link
                    href={`/edit-announcement/${announcement.id}`}
                    className="bg-white text-black px-5 py-3 rounded-2xl font-semibold hover:bg-zinc-200 transition"
                  >
                    Edit Announcement
                  </Link>

                  <button
                    onClick={() => handleToggleAnnouncementActive(announcement)}
                    className="border border-zinc-700 text-zinc-300 px-5 py-3 rounded-2xl hover:bg-zinc-800 transition"
                  >
                    {announcement.is_active
                      ? "Hide Announcement"
                      : "Unhide Announcement"}
                  </button>

                  <button
                    onClick={() =>
                      handleDeleteAnnouncement(announcement.id)
                    }
                    className="border border-red-900 text-red-400 px-5 py-3 rounded-2xl hover:bg-red-950 transition"
                  >
                    Delete Announcement
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