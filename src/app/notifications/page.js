"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/formatDate";

export default function NotificationsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  useEffect(() => {
    async function loadNotifications() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        alert(error.message);
      } else {
        setNotifications(data || []);
      }

      setLoading(false);
    }

    loadNotifications();
  }, [router]);

  async function markAsRead(notificationId) {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (error) {
      alert(error.message);
      return;
    }

    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, is_read: true }
          : notification
      )
    );

    window.dispatchEvent(
      new Event("notificationsUpdated")
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  async function markAllAsRead() {
    const unreadIds = notifications
      .filter((notification) => !notification.is_read)
      .map((notification) => notification.id);

    if (unreadIds.length === 0) return;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .in("id", unreadIds);

    if (error) {
      alert(error.message);
      return;
    }

    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({
        ...notification,
        is_read: true,
      }))
    );

    window.dispatchEvent(new Event("notificationsUpdated"));
  }

  async function deleteNotification(notificationId) {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId);

    if (error) {
      alert(error.message);
      return;
    }

    setNotifications((currentNotifications) =>
      currentNotifications.filter(
        (notification) => notification.id !== notificationId
      )
    );

    window.dispatchEvent(new Event("notificationsUpdated"));
  }

  async function clearReadNotifications() {
    const readIds = notifications
      .filter((notification) => notification.is_read)
      .map((notification) => notification.id);

    if (readIds.length === 0) return;

    const { error } = await supabase
      .from("notifications")
      .delete()
      .in("id", readIds);

    if (error) {
      alert(error.message);
      return;
    }

    setNotifications((currentNotifications) =>
      currentNotifications.filter(
        (notification) => !notification.is_read
      )
    );

    window.dispatchEvent(new Event("notificationsUpdated"));
  }

  const filteredNotifications = notifications.filter(
    (notification) => {
      const statusMatches =
        filter === "All" ||
        (filter === "Unread" &&
          !notification.is_read) ||
        (filter === "Read" &&
          notification.is_read);

      const typeMatches =
        typeFilter === "All" ||
        notification.type === typeFilter;

      const searchText = search.toLowerCase();

      const searchMatches =
        notification.title
          ?.toLowerCase()
          .includes(searchText) ||
        notification.message
          ?.toLowerCase()
          .includes(searchText);

      return (
        statusMatches &&
        typeMatches &&
        searchMatches
      );
    }
  );

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-10">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/dashboard"
          className="inline-block mb-8 border border-zinc-700 px-5 py-3 rounded-2xl hover:bg-zinc-800"
        >
          Back to Dashboard
        </Link>

        <h1 className="text-5xl font-bold mb-4">Notifications</h1>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <p className="text-zinc-400 text-lg">
            You have {unreadCount} unread notification
            {unreadCount === 1 ? "" : "s"}.
          </p>

          <div className="flex gap-4 flex-wrap">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="bg-white text-black px-5 py-3 rounded-2xl font-semibold"
              >
                Mark All Read
              </button>
            )}

            <button
              onClick={clearReadNotifications}
              className="border border-zinc-700 px-5 py-3 rounded-2xl hover:bg-zinc-800"
            >
              Clear Read
            </button>

            <Link
              href="/notification-preferences"
              className="border border-zinc-700 px-5 py-3 rounded-2xl hover:bg-zinc-800"
            >
              Preferences
            </Link>
          </div>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search notifications..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4 mb-4"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4 mb-4"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Unread">Unread</option>
            <option value="Read">Read</option>
          </select>

          <select
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4 mb-4"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="follow">Follow</option>
            <option value="favorite">Favorite</option>
            <option value="review">Review</option>
            <option value="cart">Cart</option>
            <option value="revenue">Revenue</option>
          </select>

          <p className="text-zinc-400">
            Showing {filteredNotifications.length} notification
            {filteredNotifications.length === 1 ? "" : "s"}
          </p>
        </div>

        {filteredNotifications.length === 0 ? (
          <div>
            <p className="text-zinc-400">No notifications yet.</p>

            <Link
              href="/dashboard"
              className="inline-block mt-6 bg-white text-black px-6 py-3 rounded-2xl font-semibold"
            >
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`border rounded-3xl p-6 ${
                  notification.is_read
                    ? "bg-zinc-900 border-zinc-800 opacity-70"
                    : "bg-zinc-900 border-white"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold">
                      {notification.title}
                    </h2>

                    <div className="mt-3">
                      <span className="inline-block bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm">
                        {notification.type || "general"}
                      </span>
                    </div>

                    <p className="text-zinc-500 text-sm mt-1">
                      {formatDate(notification.created_at)}
                    </p>

                    {notification.message && (
                      <p className="text-zinc-400 mt-3">
                        {notification.message}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="bg-white text-black px-5 py-3 rounded-2xl font-semibold"
                      >
                        Mark Read
                      </button>
                    )}

                    <button
                      onClick={() =>
                        deleteNotification(notification.id)
                      }
                      className="border border-red-900 text-red-400 px-5 py-3 rounded-2xl hover:bg-red-950"
                    >
                      Delete
                    </button>
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