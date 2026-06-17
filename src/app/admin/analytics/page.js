"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value || 0));
}

function formatDate(dateString) {
  if (!dateString) return "Unknown";
  return new Date(dateString).toLocaleString();
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

function SectionHeader({ title, href, actionLabel }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="text-2xl font-bold">{title}</h2>

      <Link
        href={href}
        className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 hover:bg-zinc-800"
      >
        {actionLabel}
      </Link>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    async function loadAnalytics() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch("/api/admin/analytics", {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to load admin analytics.");
        router.push("/admin");
        return;
      }

      setAnalytics(data.analytics);
      setLoading(false);
    }

    loadAnalytics();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-10 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <Link
          href="/admin"
          className="inline-block rounded-2xl border border-zinc-700 px-5 py-3 hover:bg-zinc-800"
        >
          Back to Admin
        </Link>

        <section className="rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Platform Overview
          </p>

          <h1 className="mt-2 text-5xl font-bold">Admin Analytics</h1>

          <p className="mt-4 max-w-3xl text-zinc-400">
            Monitor users, creators, marketplace activity, revenue records,
            verification requests, and recent platform activity.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/admin/users" className="rounded-2xl bg-white px-5 py-3 font-semibold text-black hover:bg-zinc-200">
              Users
            </Link>

            <Link href="/admin/creators" className="rounded-2xl border border-zinc-700 px-5 py-3 font-semibold text-zinc-300 hover:bg-zinc-800">
              Creators
            </Link>

            <Link href="/admin/products" className="rounded-2xl border border-zinc-700 px-5 py-3 font-semibold text-zinc-300 hover:bg-zinc-800">
              Products
            </Link>

            <Link href="/admin/announcements" className="rounded-2xl border border-zinc-700 px-5 py-3 font-semibold text-zinc-300 hover:bg-zinc-800">
              Announcements
            </Link>

            <Link href="/admin/verification-requests" className="rounded-2xl border border-zinc-700 px-5 py-3 font-semibold text-zinc-300 hover:bg-zinc-800">
              Verification Requests
            </Link>
          </div>
        </section>

        <section>
          <SectionHeader title="Users" href="/admin/users" actionLabel="Manage Users" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Users" value={analytics.users.total} />
            <StatCard label="Admins" value={analytics.users.admins} />
            <StatCard label="Suspended Users" value={analytics.users.suspended} />
            <StatCard label="Creators" value={analytics.creators.total} />
          </div>
        </section>

        <section>
          <SectionHeader title="Creators" href="/admin/creators" actionLabel="Manage Creators" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Total Creators" value={analytics.creators.total} />
            <StatCard label="Verified Creators" value={analytics.creators.verified} />
            <StatCard label="Unverified Creators" value={analytics.creators.unverified} />
          </div>
        </section>

        <section>
          <SectionHeader title="Marketplace" href="/admin/products" actionLabel="Manage Products" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Total Products" value={analytics.marketplace.totalProducts} />
            <StatCard label="Active Products" value={analytics.marketplace.activeProducts} />
            <StatCard label="Hidden Products" value={analytics.marketplace.hiddenProducts} />
          </div>
        </section>

        <section>
          <SectionHeader title="Announcements" href="/admin/announcements" actionLabel="Manage Announcements" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Announcements" value={analytics.announcements.total} />
            <StatCard label="Active Announcements" value={analytics.announcements.active} />
            <StatCard label="Hidden by Creator" value={analytics.announcements.hiddenByCreator} />
            <StatCard label="Hidden by Admin" value={analytics.announcements.hiddenByAdmin} />
          </div>
        </section>

        <section>
          <SectionHeader title="Revenue" href="/revenue" actionLabel="View Revenue" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Total Tracked Revenue"
              value={formatCurrency(analytics.revenue.totalTrackedRevenue)}
            />
            <StatCard label="Revenue Entries" value={analytics.revenue.totalEntries} />
            <StatCard label="Entries This Month" value={analytics.revenue.entriesThisMonth} />
          </div>
        </section>

        <section>
          <SectionHeader
            title="Verification Requests"
            href="/admin/verification-requests"
            actionLabel="Review Requests"
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Total Requests" value={analytics.requests.totalVerificationRequests} />
            <StatCard label="Pending" value={analytics.requests.pendingVerificationRequests} />
            <StatCard label="Approved" value={analytics.requests.approvedVerificationRequests} />
            <StatCard label="Rejected" value={analytics.requests.rejectedVerificationRequests} />
            <StatCard label="Revoked" value={analytics.requests.revokedVerificationRequests} />
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Recent Activity</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Latest users, products, and verification activity.
              </p>
            </div>

            <Link
              href="/admin/users"
              className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 hover:bg-zinc-800"
            >
              View Users
            </Link>
          </div>

          {analytics.recentActivity.length === 0 ? (
            <p className="text-zinc-400">No recent activity found.</p>
          ) : (
            <div className="space-y-3">
              {analytics.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-300">
                        {activity.type}
                      </span>

                      <h3 className="mt-3 font-semibold">{activity.title}</h3>
                    </div>

                    <p className="text-sm text-zinc-500">
                      {formatDate(activity.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}