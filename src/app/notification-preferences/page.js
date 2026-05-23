"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function NotificationPreferencesPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState("");
  const [preferences, setPreferences] = useState({
    follows: true,
    favorites: true,
    reviews: true,
    cart_activity: true,
    revenue_imports: true,
  });

  useEffect(() => {
    async function loadPreferences() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setPreferences({
          follows: data.follows,
          favorites: data.favorites,
          reviews: data.reviews,
          cart_activity: data.cart_activity,
          revenue_imports: data.revenue_imports,
        });
      }

      setLoading(false);
    }

    loadPreferences();
  }, [router]);

  async function updatePreference(key, value) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const updatedPreferences = {
      ...preferences,
      [key]: value,
    };

    setPreferences(updatedPreferences);

    const { error } = await supabase
      .from("notification_preferences")
      .upsert(
        {
          user_id: user.id,
          ...updatedPreferences,
        },
        {
          onConflict: "user_id",
        }
      );

    if (error) {
      alert(error.message);
    } else {
      setSaveMessage("Preferences updated.");

      setTimeout(() => {
        setSaveMessage("");
      }, 2000);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const preferenceItems = [
    {
      key: "follows",
      title: "New Followers",
      description: "Get notified when someone follows your creator profile.",
    },
    {
      key: "favorites",
      title: "Product Favorites",
      description: "Get notified when someone saves one of your products.",
    },
    {
      key: "reviews",
      title: "Product Reviews",
      description: "Get notified when someone reviews one of your products.",
    },
    {
      key: "cart_activity",
      title: "Cart Activity",
      description: "Get notified when someone adds one of your products to cart.",
    },
    {
      key: "revenue_imports",
      title: "Revenue Imports",
      description: "Get notified when a revenue CSV import completes.",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-10">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/notifications"
          className="inline-block mb-8 border border-zinc-700 px-5 py-3 rounded-2xl hover:bg-zinc-800"
        >
          Back to Notifications
        </Link>

        <h1 className="text-5xl font-bold mb-4">
          Notification Preferences
        </h1>

        <p className="text-zinc-400 text-lg mb-10">
          Choose which notifications you want to receive.
        </p>

        {saveMessage && (
          <div className="bg-green-500/10 border border-green-500 text-green-400 rounded-2xl p-4 mb-6">
            {saveMessage}
          </div>
        )}

        <div className="space-y-4">
          {preferenceItems.map((item) => (
            <div
              key={item.key}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex items-center justify-between gap-6"
            >
              <div>
                <h2 className="text-2xl font-semibold">
                  {item.title}
                </h2>

                <p className="text-zinc-400 mt-2">
                  {item.description}
                </p>
              </div>

              <button
                onClick={() =>
                  updatePreference(item.key, !preferences[item.key])
                }
                className={`px-5 py-3 rounded-2xl font-semibold ${
                  preferences[item.key]
                    ? "bg-white text-black"
                    : "border border-zinc-700 text-zinc-400"
                }`}
              >
                {preferences[item.key] ? "On" : "Off"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}