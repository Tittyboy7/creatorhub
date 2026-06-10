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
      .update({ is_active: !announcement.is_active })
      .eq("id", announcement.id);

    if (error) {
      alert(error.message);
      return;
    }

    setAnnouncements((current) =>
      current.map((item) =>
        item.id === announcement.id
          ? { ...item, is_active: !announcement.is_active }
          : item
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

    setAnnouncements((current) =>
      current.filter((announcement) => announcement.id !== announcementId)
    );
  }

  if (loading) {
    return <p className="text-zinc-400">Loading announcements...</p>;
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold">Announcements</h2>
          <p className="mt-2 text-zinc-400">
            Manage updates for {creator?.display_name}.
          </p>
        </div>

        <Link
          href="/add-announcement"
          className="rounded-xl bg-white px-5 py-3 text-center font-semibold text-black hover:bg-zinc-200"
        >
          Add Announcement
        </Link>
      </div>

      {announcements.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <h3 className="text-xl font-bold">No announcements yet</h3>

          <p className="mt-2 text-zinc-400">
            Share updates with your followers and storefront visitors.
          </p>

          <Link
            href="/add-announcement"
            className="mt-6 inline-block rounded-xl bg-white px-5 py-3 font-semibold text-black hover:bg-zinc-200"
          >
            Add your first announcement
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`rounded-2xl border bg-zinc-900 p-5 ${
                announcement.is_active
                  ? "border-zinc-800"
                  : "border-red-900 opacity-80"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-xl font-semibold">
                    {announcement.title}
                  </h3>

                  <p className="mt-1 text-sm text-zinc-500">
                    {formatDate(announcement.created_at)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className={`w-fit rounded-full px-3 py-1 text-sm ${
                      announcement.is_active
                        ? "bg-green-950 text-green-400"
                        : "bg-red-950 text-red-400"
                    }`}
                  >
                    {announcement.is_active ? "Active" : "Hidden by you"}
                  </span>

                  {announcement.admin_hidden && (
                    <span className="w-fit rounded-full bg-red-950 px-3 py-1 text-sm text-red-400">
                      Hidden by admin
                    </span>
                  )}
                </div>
              </div>

              {announcement.content && (
                <p className="mt-4 whitespace-pre-wrap text-zinc-400">
                  {announcement.content}
                </p>
              )}

              {announcement.products && (
                <Link
                  href={`/product/${announcement.products.id}`}
                  className="mt-4 inline-block text-sm text-zinc-400 hover:text-white"
                >
                  Linked product: {announcement.products.title}
                </Link>
              )}

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/edit-announcement/${announcement.id}`}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200"
                >
                  Edit
                </Link>

                <button
                  onClick={() => handleToggleAnnouncementActive(announcement)}
                  disabled={announcement.admin_hidden}
                  className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {announcement.admin_hidden
                    ? "Hidden by Admin"
                    : announcement.is_active
                    ? "Hide"
                    : "Unhide"}
                </button>

                <button
                  onClick={() => handleDeleteAnnouncement(announcement.id)}
                  className="rounded-xl border border-red-900 px-4 py-2 text-sm text-red-400 hover:bg-red-950"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}