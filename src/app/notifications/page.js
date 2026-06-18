"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/formatDate";
import { getNotificationTypeClass } from "@/lib/notificationStyles";

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

    window.dispatchEvent(new Event("notificationsUpdated"));
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
      currentNotifications.filter((notification) => !notification.is_read)
    );

    window.dispatchEvent(new Event("notificationsUpdated"));
  }

  const filteredNotifications = notifications.filter((notification) => {
    const statusMatches =
      filter === "All" ||
      (filter === "Unread" && !notification.is_read) ||
      (filter === "Read" && notification.is_read);

    const typeMatches =
      typeFilter === "All" || notification.type === typeFilter;

    const searchText = search.toLowerCase();

    const searchMatches =
      notification.title?.toLowerCase().includes(searchText) ||
      notification.message?.toLowerCase().includes(searchText);

    return statusMatches && typeMatches && searchMatches;
  });

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-5 py-8 text-white md:p-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <Link
          href="/dashboard"
          className="inline-block rounded-2xl border border-zinc-700 px-5 py-3 hover:bg-zinc-800"
        >
          Back to Dashboard
        </Link>

        <section className="rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Account Inbox
          </p>

          <h1 className="mt-2 text-4xl font-bold md:text-5xl">
            Notifications
          </h1>

          <p className="mt-4 max-w-3xl text-zinc-400">
            View creator updates, moderation notices, revenue activity, and
            important account messages.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <button
              onClick={() => setFilter("All")}
              className={`rounded-2xl border p-4 text-left transition ${
                filter === "All"
                  ? "border-white bg-zinc-800"
                  : "border-zinc-800 bg-zinc-950 hover:border-zinc-600"
              }`}
            >
              <p className="text-xs text-zinc-500">All</p>
              <p className="mt-1 text-2xl font-bold">{notifications.length}</p>
            </button>

            <button
              onClick={() => setFilter("Unread")}
              className={`rounded-2xl border p-4 text-left transition ${
                filter === "Unread"
                  ? "border-white bg-zinc-800"
                  : "border-zinc-800 bg-zinc-950 hover:border-zinc-600"
              }`}
            >
              <p className="text-xs text-zinc-500">Unread</p>
              <p className="mt-1 text-2xl font-bold">{unreadCount}</p>
            </button>

            <button
              onClick={() => setFilter("Read")}
              className={`rounded-2xl border p-4 text-left transition ${
                filter === "Read"
                  ? "border-white bg-zinc-800"
                  : "border-zinc-800 bg-zinc-950 hover:border-zinc-600"
              }`}
            >
              <p className="text-xs text-zinc-500">Read</p>
              <p className="mt-1 text-2xl font-bold">
                {notifications.length - unreadCount}
              </p>
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-zinc-400">
              You have {unreadCount} unread notification
              {unreadCount === 1 ? "" : "s"}.
            </p>

            <div className="flex flex-wrap gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-zinc-200"
                >
                  Mark All Read
                </button>
              )}

              <button
                onClick={clearReadNotifications}
                className="rounded-2xl border border-zinc-700 px-5 py-3 text-sm font-semibold hover:bg-zinc-800"
              >
                Clear Read
              </button>

              <Link
                href="/notification-preferences"
                className="rounded-2xl border border-zinc-700 px-5 py-3 text-sm font-semibold hover:bg-zinc-800"
              >
                Preferences
              </Link>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-[1fr_240px]">
            <input
              type="text"
              placeholder="Search notifications..."
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 outline-none focus:border-zinc-600"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 outline-none focus:border-zinc-600"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="moderation">Moderation</option>
              <option value="warning">Warning</option>
              <option value="appeal">Appeal</option>
              <option value="verification">Verification</option>
              <option value="product">Product</option>
              <option value="follow">Follow</option>
              <option value="favorite">Favorite</option>
              <option value="review">Review</option>
              <option value="cart">Cart</option>
              <option value="revenue">Revenue</option>
              <option value="general">General</option>
            </select>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-zinc-400">
                Showing {filteredNotifications.length} notification
                {filteredNotifications.length === 1 ? "" : "s"}
              </p>

              {(search || filter !== "All" || typeFilter !== "All") && (
                <p className="mt-1 text-sm text-zinc-500">
                  Filters active
                  {search ? ` · Search: "${search}"` : ""}
                  {filter !== "All" ? ` · Status: ${filter}` : ""}
                  {typeFilter !== "All" ? ` · Type: ${typeFilter}` : ""}
                </p>
              )}
            </div>

            {(search || filter !== "All" || typeFilter !== "All") && (
              <button
                onClick={() => {
                  setSearch("");
                  setFilter("All");
                  setTypeFilter("All");
                }}
                className="w-fit text-sm font-semibold text-zinc-400 hover:text-white"
              >
                Clear filters
              </button>
            )}
          </div>
        </section>

        {filteredNotifications.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center">
            <h2 className="text-2xl font-bold">
              {notifications.length === 0
                ? "No notifications yet"
                : "No matching notifications"}
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-zinc-400">
              {notifications.length === 0
                ? "Warnings, appeals, verification updates, product changes, and other account activity will appear here."
                : "Try clearing your filters or changing your search."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-3xl border p-5 transition ${
                  notification.is_read
                    ? "border-zinc-800 bg-zinc-900 opacity-75"
                    : "border-white bg-zinc-900"
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      {!notification.is_read && (
                        <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-black">
                          New
                        </span>
                      )}

                      <span
                        className={`rounded-full px-3 py-1 text-sm font-semibold ${getNotificationTypeClass(
                          notification.type || "general"
                        )}`}
                      >
                        {notification.type || "general"}
                      </span>

                      <span className="text-sm text-zinc-500">
                        {formatDate(notification.created_at)}
                      </span>
                    </div>

                    <h2 className="mt-3 text-xl font-semibold">
                      {notification.title}
                    </h2>

                    {notification.message && (
                      <p className="mt-3 text-zinc-400">
                        {notification.message}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-3 sm:justify-end">
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200"
                      >
                        Mark Read
                      </button>
                    )}

                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="rounded-2xl border border-red-900 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-950"
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