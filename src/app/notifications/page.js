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

        <p className="text-zinc-400 text-lg mb-10">
          You have {unreadCount} unread notification
          {unreadCount === 1 ? "" : "s"}.
        </p>

        {notifications.length === 0 ? (
          <p className="text-zinc-400">No notifications yet.</p>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
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

                    <p className="text-zinc-500 text-sm mt-1">
                      {formatDate(notification.created_at)}
                    </p>

                    {notification.message && (
                      <p className="text-zinc-400 mt-3">
                        {notification.message}
                      </p>
                    )}
                  </div>

                  {!notification.is_read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="bg-white text-black px-5 py-3 rounded-2xl font-semibold"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}