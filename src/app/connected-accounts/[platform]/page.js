"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const platformInfo = {
  youtube: {
    name: "YouTube",
    description:
      "Connect YouTube to automatically sync analytics and revenue data.",
  },
  twitch: {
    name: "Twitch",
    description:
      "Connect Twitch to sync subscriptions, donations, and creator revenue.",
  },
  kick: {
    name: "Kick",
    description:
      "Connect Kick to sync followers, subscribers, stream activity, and revenue.",
  },
  shopify: {
    name: "Shopify",
    description:
      "Connect Shopify to sync product sales and store revenue.",
  },
  patreon: {
    name: "Patreon",
    description:
      "Connect Patreon to sync memberships and recurring income.",
  },
};

export default function PlatformConnectionPage() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [shopDomain, setShopDomain] = useState("");

  const platform = params.platform;
  const details = platformInfo[platform];

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);
      setLoading(false);
    }

    loadUser();
  }, [router]);

  if (loading) {
    return <p className="text-zinc-400">Loading integration...</p>;
  }

  function getShopifyOAuthUrl() {
    const cleanedDomain = shopDomain
      .trim()
      .replace("https://", "")
      .replace("http://", "");

    if (!cleanedDomain) return "";

    return `/api/auth/shopify/start?user_id=${user.id}&shop=${encodeURIComponent(
      cleanedDomain
    )}`;
  }

  if (!details) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Platform Not Found</h1>

        <Link
          href="/connected-accounts"
          className="inline-block rounded-2xl border border-zinc-700 px-5 py-3 hover:bg-zinc-800"
        >
          Back
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/connected-accounts"
        className="inline-block rounded-2xl border border-zinc-700 px-5 py-3 hover:bg-zinc-800"
      >
        Back to Connected Accounts
      </Link>

      <div className="rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Integration
        </p>

        <h1 className="mt-2 text-4xl font-bold">Connect {details.name}</h1>

        <p className="mt-4 max-w-3xl text-zinc-400">
          {details.description}
        </p>

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-xl font-bold">Connect {details.name}</h2>

          <p className="mt-3 text-zinc-400">
            Start the secure connection process for this platform.
          </p>

          <div className="mt-6">
            {platform === "youtube" ? (
              <Link
                href={`/api/auth/google/start?user_id=${user.id}`}
                className="inline-block rounded-2xl bg-white px-6 py-3 font-semibold text-black hover:bg-zinc-200"
              >
                Connect YouTube
              </Link>
            ) : platform === "twitch" ? (
              <Link
                href={`/api/auth/twitch/start?user_id=${user.id}`}
                className="inline-block rounded-2xl bg-white px-6 py-3 font-semibold text-black hover:bg-zinc-200"
              >
                Connect Twitch
              </Link>
            ) : platform === "kick" ? (
              <Link
                href={`/api/auth/kick/start?user_id=${user.id}`}
                className="inline-block rounded-2xl bg-white px-6 py-3 font-semibold text-black hover:bg-zinc-200"
              >
                Connect Kick
              </Link>
            ) : platform === "patreon" ? (
              <Link
                href={`/api/auth/patreon/start?user_id=${user.id}`}
                className="inline-block rounded-2xl bg-white px-6 py-3 font-semibold text-black hover:bg-zinc-200"
              >
                Connect Patreon
              </Link>  
            ) : platform === "shopify" ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={shopDomain}
                  onChange={(e) => setShopDomain(e.target.value)}
                  placeholder="your-store.myshopify.com"
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder:text-zinc-500"
                />

                <Link
                  href={getShopifyOAuthUrl() || "#"}
                  className={`inline-block rounded-2xl px-6 py-3 font-semibold ${
                    shopDomain.trim()
                      ? "bg-white text-black hover:bg-zinc-200"
                      : "cursor-not-allowed border border-zinc-700 text-zinc-500"
                  }`}
                >
                  Connect Shopify
                </Link>
              </div>
            ) : (
              <button
                disabled
                className="rounded-2xl border border-zinc-700 px-6 py-3 font-semibold text-zinc-500"
              >
                Coming Soon
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}