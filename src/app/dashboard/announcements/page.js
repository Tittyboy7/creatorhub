"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/formatDate";
import SuspendedAccountMessage from "@/components/SuspendedAccountMessage";

export default function DashboardAnnouncementsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [creator, setCreator] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [isSuspended, setIsSuspended] = useState(false);

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
        .select("is_suspended")
        .eq("id", user.id)
        .single();

      if (profile?.is_suspended) {
        setIsSuspended(true);
        setLoading(false);
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

  const filteredAnnouncements = announcements.filter((announcement) => {
    if (statusFilter === "Active") return announcement.is_active;
    if (statusFilter === "Hidden") return !announcement.is_active;
    return true;
  });

  if (loading) {
    return <p className="text-zinc-400">Loading announcements...</p>;
  }

  if (isSuspended) {
    return <SuspendedAccountMessage />;
  }

  return (
    <div>
      <section className="mb-8 rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Audience Updates
            </p>

            <h2 className="text-3xl font-bold">Announcements</h2>

            <p className="mt-2 max-w-2xl text-zinc-400">
              Manage updates, product drops, news, and storefront announcements for {creator?.display_name}.
            </p>
          </div>

          <Link
            href="/add-announcement"
            className="rounded-2xl bg-white px-5 py-3 text-center font-semibold text-black hover:bg-zinc-200"
          >
            Add Announcement
          </Link>
        </div>
      </section>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Total Announcements</p>
          <p className="mt-2 text-3xl font-bold">{announcements.length}</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Active</p>
          <p className="mt-2 text-3xl font-bold">
            {announcements.filter((announcement) => announcement.is_active).length}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Hidden</p>
          <p className="mt-2 text-3xl font-bold">
            {announcements.filter((announcement) => !announcement.is_active).length}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Linked Products</p>
          <p className="mt-2 text-3xl font-bold">
            {announcements.filter((announcement) => announcement.products).length}
          </p>
        </div>
      </div>

      <div className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="mb-5">
          <h3 className="text-2xl font-bold">
            Announcement Performance
          </h3>

          <p className="mt-1 text-sm text-zinc-500">
            Overview of your creator communications.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-sm text-zinc-400">
              Latest Announcement
            </p>

            <p className="mt-2 text-lg font-semibold">
              {announcements[0]?.title || "None"}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-sm text-zinc-400">
              Active Announcements
            </p>

            <p className="mt-2 text-3xl font-bold">
              {
                announcements.filter(
                  (announcement) => announcement.is_active
                ).length
              }
            </p>
          </div>

    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <p className="text-sm text-zinc-400">
        Product Linked
      </p>

      <p className="mt-2 text-3xl font-bold">
        {
          announcements.filter(
            (announcement) => announcement.products
          ).length
        }
      </p>
    </div>
  </div>
</div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-2xl font-bold">Announcement Library</h3>

          <p className="mt-1 text-sm text-zinc-500">
            Edit, publish, hide, or remove storefront announcements.
          </p>

          <p className="mt-2 text-sm text-zinc-500">
            Showing {filteredAnnouncements.length} announcement
            {filteredAnnouncements.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {["All", "Active", "Hidden"].map((option) => (
            <button
              key={option}
              onClick={() => setStatusFilter(option)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                statusFilter === option
                  ? "border-white bg-white text-black"
                  : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {filteredAnnouncements.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <h3 className="text-xl font-bold">
            {announcements.length === 0
              ? "No announcements yet"
              : "No matching announcements"}
          </h3>

          <p className="mt-2 text-zinc-400">
            {announcements.length === 0
              ? "Share updates with your followers and storefront visitors."
              : "Try changing the announcement status filter."}
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
          {filteredAnnouncements.map((announcement) => (
            <div
              key={announcement.id}
              className={`rounded-3xl border bg-zinc-900 p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 ${
                announcement.is_active
                  ? "border-zinc-800 hover:border-zinc-600"
                  : "border-red-900 opacity-80 hover:border-red-700"
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

              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href={`/edit-announcement/${announcement.id}`}
                  className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
                >
                  Edit
                </Link>

                <button
                  onClick={() => handleToggleAnnouncementActive(announcement)}
                  disabled={announcement.admin_hidden}
                  className="rounded-2xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {announcement.admin_hidden
                    ? "Hidden by Admin"
                    : announcement.is_active
                    ? "Hide"
                    : "Unhide"}
                </button>

                <button
                  onClick={() => handleDeleteAnnouncement(announcement.id)}
                  className="rounded-2xl border border-red-900 px-4 py-2 text-sm text-red-400 transition hover:bg-red-950"
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