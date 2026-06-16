"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    flaggedProducts: 0,
    hiddenProducts: 0,
    totalCreators: 0,
    totalAnnouncements: 0,
    pendingVerificationRequests: 0,
  });

  useEffect(() => {
    async function checkAdmin() {
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

      const { count: totalProducts } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      const { count: flaggedProducts } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("is_flagged", true);

      const { count: hiddenProducts } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("is_active", false);

      const { count: totalCreators } = await supabase
        .from("creators")
        .select("*", { count: "exact", head: true });

      const { count: totalAnnouncements } = await supabase
        .from("announcements")
        .select("*", { count: "exact", head: true });

      const { count: pendingVerificationRequests } = await supabase
        .from("verification_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      setStats({
        totalProducts: totalProducts || 0,
        flaggedProducts: flaggedProducts || 0,
        hiddenProducts: hiddenProducts || 0,
        totalCreators: totalCreators || 0,
        totalAnnouncements: totalAnnouncements || 0,
        pendingVerificationRequests: pendingVerificationRequests || 0,
      });

      setLoading(false);
    }

    checkAdmin();
  }, [router]);

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
        <h1 className="text-5xl font-bold mb-4">Admin Dashboard</h1>

        <p className="text-zinc-400 text-lg mb-10">
          Moderation tools for CreatorsHub.
        </p>

        <div className="grid md:grid-cols-5 gap-6 mb-10">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <p className="text-zinc-400">Total Products</p>
            <p className="text-4xl font-bold mt-2">{stats.totalProducts}</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <p className="text-zinc-400">Flagged Products</p>
            <p className="text-4xl font-bold mt-2">{stats.flaggedProducts}</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <p className="text-zinc-400">Hidden Products</p>
            <p className="text-4xl font-bold mt-2">{stats.hiddenProducts}</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <p className="text-zinc-400">Creators</p>
            <p className="text-4xl font-bold mt-2">{stats.totalCreators}</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <p className="text-zinc-400">Announcements</p>
            <p className="text-4xl font-bold mt-2">
              {stats.totalAnnouncements}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Link
            href="/admin/products"
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-600 transition"
          >
            <h2 className="text-2xl font-bold">Products</h2>
            <p className="text-zinc-400 mt-2">
              Review, hide, or flag marketplace products.
            </p>
          </Link>

          <Link
            href="/admin/creators"
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-600 transition"
          >
            <h2 className="text-2xl font-bold">Creators</h2>
            <p className="text-zinc-400 mt-2">
              Review creator profiles and storefronts.
            </p>
          </Link>

          <Link
            href="/admin/announcements"
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-600 transition"
          >
            <h2 className="text-2xl font-bold">Announcements</h2>
            <p className="text-zinc-400 mt-2">
              Review announcements and linked product posts.
            </p>
          </Link>

          <Link
            href="/admin/verification-requests"
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-600 transition"
          >
            <h2 className="text-2xl font-bold">Verification Requests</h2>

            <p className="text-zinc-400 mt-2">
              Review creator verification requests.
            </p>

            <p className="mt-4 text-3xl font-bold text-yellow-400">
              {stats.pendingVerificationRequests}
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              pending request
              {stats.pendingVerificationRequests === 1 ? "" : "s"}
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}