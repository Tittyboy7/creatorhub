"use client";

import { formatDate } from "@/lib/formatDate";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getAccentBadgeClass } from "@/lib/accentColors";
import SuspendedAccountMessage from "@/components/SuspendedAccountMessage";
import { buildBusinessSignals } from "@/lib/business/buildBusinessSignals";
import { buildBusinessCauses } from "@/lib/business/buildBusinessCauses";
import { buildBusinessIntelligence } from "@/lib/business/buildBusinessIntelligence";
import { buildBusinessMetrics } from "@/lib/business/buildBusinessMetrics";
import { summarizeBusinessMetrics } from "@/lib/business/summarizeBusinessMetrics";

function getNotificationTypeClass(type) {
  if (type === "follow") return "bg-blue-950 text-blue-400";
  if (type === "favorite") return "bg-pink-950 text-pink-400";
  if (type === "review") return "bg-yellow-950 text-yellow-400";
  if (type === "cart") return "bg-green-950 text-green-400";
  if (type === "revenue") return "bg-purple-950 text-purple-400";

  return "bg-zinc-800 text-zinc-300";
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value || 0));
}

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [creator, setCreator] = useState(null);
  const [products, setProducts] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [totalFavorites, setTotalFavorites] = useState(0);
  const [totalFollowers, setTotalFollowers] = useState(0);
  const [revenueEntries, setRevenueEntries] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [verificationRequest, setVerificationRequest] = useState(null);
  const [showMoreAnalytics, setShowMoreAnalytics] = useState(false);
  const [showSetupSteps, setShowSetupSteps] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);

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

      setCreator(creatorData);

      if (creatorData) {
        const { data: productData } = await supabase
          .from("products")
          .select("*")
          .eq("creator_id", creatorData.id);

        setProducts(productData || []);

        const { data: announcementData } = await supabase
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

        setAnnouncements(announcementData || []);

        if (productData && productData.length > 0) {
          const productIds = productData.map((product) => product.id);

          const { count } = await supabase
            .from("favorites")
            .select("*", { count: "exact", head: true })
            .in("product_id", productIds);

          setTotalFavorites(count || 0);
        }

        const { count: followerCount } = await supabase
          .from("followers")
          .select("*", { count: "exact", head: true })
          .eq("creator_id", creatorData.id);

        setTotalFollowers(followerCount || 0);

        const { data: revenueData } = await supabase
          .from("revenue_entries")
          .select("*")
          .eq("creator_id", creatorData.id)
          .order("entry_month", { ascending: false });

        setRevenueEntries(revenueData || []);

        const revenueTotal = (revenueData || []).reduce(
          (sum, entry) => sum + Number(entry.amount || 0),
          0
        );

        setTotalRevenue(revenueTotal);

        const { data: latestRequest } = await supabase
          .from("verification_requests")
          .select("*")
          .eq("creator_id", creatorData.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        setVerificationRequest(latestRequest);
      }

      const { data: notificationData } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);

      setNotifications(notificationData || []);
      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  const totalViews = products.reduce(
    (sum, product) => sum + (product.views || 0),
    0
  );

  const totalCheckoutClicks = products.reduce(
    (sum, product) => sum + (product.checkout_clicks || 0),
    0
  );

  const ratedProducts = products.filter(
    (product) => Number(product.reviews_count || 0) > 0
  );

  const averageRating =
    ratedProducts.length === 0
      ? "0.0"
      : (
          ratedProducts.reduce(
            (sum, product) => sum + Number(product.average_rating || 0),
            0
          ) / ratedProducts.length
        ).toFixed(1);

  const currentMonth = new Date().toISOString().slice(0, 7);

  const currentMonthLabel = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const revenueThisMonth = revenueEntries
    .filter((entry) => entry.entry_month === currentMonth)
    .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);

  const announcementsThisMonth = announcements.filter((announcement) =>
    announcement.created_at?.startsWith(currentMonth)
  ).length;

  const productsThisMonth = products.filter((product) =>
    product.created_at?.startsWith(currentMonth)
  ).length;

  const platformTotals = revenueEntries.reduce((totals, entry) => {
    totals[entry.platform] =
      (totals[entry.platform] || 0) + Number(entry.amount || 0);

    return totals;
  }, {});

  const topPlatforms = Object.entries(platformTotals)
    .map(([platform, amount]) => ({
      platform,
      amount,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4);

  const socialLinks = creator?.social_links || {};

  const hasSocialLinks = Object.values(socialLinks).some(
    (value) => value && value.trim() !== ""
  );

  const bestPlatform = topPlatforms[0];

  const topPlatformPercent =
    totalRevenue === 0 || !bestPlatform
      ? 0
      : Math.round((bestPlatform.amount / totalRevenue) * 100);

  const monthlyGrowthPercent =
    totalRevenue === 0
      ? 0
      : Math.round((revenueThisMonth / totalRevenue) * 100);

  const businessSignals = buildBusinessSignals({
    totalRevenue,
    monthlyGrowthPercent,
    topPlatformPercent,
    bestPlatform,
    platformCount: topPlatforms.length,
    revenueStreak: revenueEntries.length > 0 ? 1 : 0,
  });

  const businessCauses = buildBusinessCauses({
    signals: businessSignals,
    bestPlatform,
    monthlyGrowthPercent,
    topPlatformPercent,
  });

  const businessIntelligence = buildBusinessIntelligence({
    signals: businessSignals,
    causes: businessCauses,
  });

  const businessMetrics = buildBusinessMetrics({
    revenueEntries,
    products,
  });

  const businessMetricSummary = summarizeBusinessMetrics({
    metrics: businessMetrics,
  });

  const checklistItems = [
    {
      label: "Create your creator profile",
      complete: !!creator,
      href: "/create-profile",
    },
    {
      label: "Add a profile image",
      complete: !!creator?.avatar_url,
      href: "/edit-profile",
    },
    {
      label: "Add a banner image",
      complete: !!creator?.banner_url,
      href: "/edit-profile",
    },
    {
      label: "Write a bio",
      complete: !!creator?.bio,
      href: "/edit-profile",
    },
    {
      label: "Choose your niche",
      complete: !!creator?.niche,
      href: "/edit-profile",
    },
    {
      label: "Add your first product",
      complete: products.length > 0,
      href: "/add-product",
    },
    {
      label: "Add at least one social link",
      complete: hasSocialLinks,
      href: "/edit-profile",
    },
    {
      label: "Publish your first announcement",
      complete: announcements.length > 0,
      href: "/add-announcement",
    },
  ];

  const completedCount = checklistItems.filter((item) => item.complete).length;

  const recentActivity = [
    ...announcements.slice(0, 3).map((announcement) => ({
      id: `announcement-${announcement.id}`,
      type: "Announcement",
      title: announcement.title,
      description: announcement.content || "Announcement posted",
      date: announcement.created_at,
      href: "/dashboard/announcements",
    })),

    ...revenueEntries.slice(0, 3).map((entry) => ({
      id: `revenue-${entry.id}`,
      type: "Revenue",
      title: `${entry.platform} revenue added`,
      description: `${entry.revenue_type} · ${formatCurrency(entry.amount)}`,
      date: entry.created_at,
      href: "/dashboard/revenue",
    })),

    ...notifications.slice(0, 3).map((notification) => ({
      id: `notification-${notification.id}`,
      type: notification.type || "Notification",
      title: notification.title,
      description: notification.message || "New notification",
      date: notification.created_at,
      href: "/notifications",
    })),
  ]
    .filter((activity) => activity.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  if (loading) {
    return <p className="text-zinc-400">Loading dashboard...</p>;
  }

  if (isSuspended) {
    return <SuspendedAccountMessage />;
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Overview
        </p>

        <h1 className="mt-1 text-3xl font-bold md:text-4xl">
          Creator Dashboard
        </h1>

        <p className="mt-2 text-zinc-400">
          Welcome back, {creator?.display_name || user?.email}
        </p>

        <div className="mt-8 rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Creator Business Morning Brief
              </p>

              <h2 className="mt-2 text-4xl font-bold">
                {formatCurrency(totalRevenue)}
              </h2>

              <p className="mt-2 text-sm text-zinc-400">
                Total revenue tracked across all creator income streams.
              </p>

              <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Today's Focus
                </p>

                <p className="mt-2 text-sm leading-6 text-zinc-300">
                  {businessIntelligence.summary}
                </p>

                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  {businessIntelligence.recommendation}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/add-revenue"
                  className="rounded-2xl bg-white px-5 py-3 font-semibold text-black hover:bg-zinc-200"
                >
                  Add Revenue
                </Link>

                <Link
                  href="/revenue"
                  className="rounded-2xl border border-zinc-700 px-5 py-3 hover:bg-zinc-800"
                >
                  Review Revenue Intelligence →
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold">Platform Breakdown</h3>
                  <p className="mt-1 text-sm text-zinc-500">Revenue by source</p>
                </div>
  
                <Link
                  href="/revenue"
                  className="text-sm text-zinc-400 hover:text-white"
                >
                  View →
                </Link>
              </div>

              {topPlatforms.length === 0 ? (
               <p className="text-sm text-zinc-400">
                  Add revenue entries to see your top income sources.
                </p>
              ) : (
                <div className="space-y-3">
                  {topPlatforms.map((platform) => {
                    const percent =
                      totalRevenue === 0
                        ? 0
                        : Math.round((platform.amount / totalRevenue) * 100);

                    return (
                      <div key={platform.platform}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="font-medium">{platform.platform}</span>
                          <span className="text-zinc-400">
                            {formatCurrency(platform.amount)}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                          <div
                            className="h-full rounded-full bg-white"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {creator && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
              <p className="text-sm text-zinc-400">This Month</p>
              <p className="mt-1 break-words text-2xl font-bold">
                {formatCurrency(revenueThisMonth)}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
              <p className="text-sm text-zinc-400">Followers</p>
              <p className="mt-1 text-2xl font-bold">{totalFollowers}</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
              <p className="text-sm text-zinc-400">Views</p>
              <p className="mt-1 text-2xl font-bold">{totalViews}</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
              <p className="text-sm text-zinc-400">Products</p>
              <p className="mt-1 text-2xl font-bold">{products.length}</p>
            </div>
          </div>

          {showMoreAnalytics && (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                <p className="text-sm text-zinc-400">Favorites</p>
                <p className="mt-1 text-2xl font-bold">{totalFavorites}</p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                <div className="group relative w-fit">
                  <p className="cursor-help text-sm text-zinc-400">
                    Average Rating ⓘ
                  </p>

                  <div className="pointer-events-none absolute left-0 top-full z-20 mt-2 hidden w-64 rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-xs text-zinc-400 shadow-xl group-hover:block">
                    Average rating is based only on products that have at least
                    one review.
                  </div>
                </div>

                <p className="mt-1 text-2xl font-bold">{averageRating}</p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                <p className="text-sm text-zinc-400">Checkout Clicks</p>
                <p className="mt-1 text-2xl font-bold">
                  {totalCheckoutClicks}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                <p className="text-sm text-zinc-400">Revenue Entries</p>
                <p className="mt-1 text-2xl font-bold">
                  {revenueEntries.length}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={() => setShowMoreAnalytics(!showMoreAnalytics)}
            className="text-sm font-semibold text-zinc-400 hover:text-white"
          >
            {showMoreAnalytics
              ? "Show less analytics ↑"
              : "Show more analytics ↓"}
          </button>
        </div>
      )}

      {!creator ? (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="mb-4 text-3xl font-bold">
            Create your creator profile
          </h2>

          <p className="mb-6 text-zinc-400">
            You need a creator profile before you can add products.
          </p>

          <Link
            href="/create-profile"
            className="inline-block rounded-2xl bg-white px-6 py-3 font-semibold text-black"
          >
            Create Profile
          </Link>
        </div>
      ) : (
        <>

          <div className="space-y-6">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold">Quick Actions</h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Common creator tasks.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
                <Link
                  href="/add-product"
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-center text-sm font-semibold hover:border-zinc-600 hover:bg-zinc-900"
                >
                  + Product
                </Link>

                <Link
                  href="/add-announcement"
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-center text-sm font-semibold hover:border-zinc-600 hover:bg-zinc-900"
                >
                  + Announcement
                </Link>

                <Link
                  href="/add-revenue"
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-center text-sm font-semibold hover:border-zinc-600 hover:bg-zinc-900"
                >
                  + Revenue
                </Link>

                <Link
                  href="/notifications"
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-center text-sm font-semibold hover:border-zinc-600 hover:bg-zinc-900"
                >
                  Notifications
                </Link>

                <Link
                  href={`/creator/${creator.username}`}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-center text-sm font-semibold hover:border-zinc-600 hover:bg-zinc-900"
                >
                  Storefront
                </Link>

                <Link
                  href="/connected-accounts"
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-center text-sm font-semibold hover:border-zinc-600 hover:bg-zinc-900"
                >
                  Connections
                </Link>

                <Link
                  href="/compare"
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-center text-sm font-semibold hover:border-zinc-600 hover:bg-zinc-900"
                >
                  Compare
                </Link>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Link
                href="/dashboard/products"
                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 hover:border-zinc-600"
              >
                <p className="text-zinc-400">Products</p>
                <h2 className="mt-1 text-2xl font-bold">{products.length}</h2>
                <p className="mt-3 text-sm text-zinc-500">
                  Manage listings, visibility, and product performance.
                </p>
                <p className="mt-5 text-sm font-semibold text-white">
                  Manage →
                </p>
              </Link>

              <Link
                href="/revenue"
                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 hover:border-zinc-600"
              >
                <p className="text-zinc-400">Revenue</p>
                <h2 className="mt-1 text-2xl font-bold">
                  {formatCurrency(totalRevenue)}
                </h2>
                <p className="mt-3 text-sm text-zinc-500">
                  Track income, platforms, and monthly performance.
                </p>
                <p className="mt-5 text-sm font-semibold text-white">
                  Manage →
                </p>
              </Link>

              <Link
                href="/dashboard/announcements"
                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 hover:border-zinc-600"
              >
                <p className="text-zinc-400">Announcements</p>
                <h2 className="mt-1 text-2xl font-bold">
                  {announcements.length}
                </h2>
                <p className="mt-3 text-sm text-zinc-500">
                  Manage updates for your followers and storefront visitors.
                </p>
                <p className="mt-5 text-sm font-semibold text-white">
                  Manage →
                </p>
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="mb-4">
              <h2 className="text-xl font-bold">This Month</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Activity snapshot for {currentMonthLabel}.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <Link
                href="/revenue"
                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-zinc-600 hover:bg-zinc-900"
              >
                <p className="text-sm text-zinc-400">Revenue This Month</p>

                <p className="mt-1 text-2xl font-bold">
                  {formatCurrency(revenueThisMonth)}
                </p>

                <p className="mt-3 text-xs font-semibold text-zinc-500">
                  Open revenue intelligence →
                </p>
              </Link>

              <Link
                href="/dashboard/products"
                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-zinc-600 hover:bg-zinc-900"
              >
                <p className="text-sm text-zinc-400">New Products</p>

                <p className="mt-1 text-2xl font-bold">
                  {productsThisMonth}
                </p>

                <p className="mt-3 text-xs font-semibold text-zinc-500">
                  Manage products →
                </p>
              </Link>

              <Link
                href="/dashboard/announcements"
                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-zinc-600 hover:bg-zinc-900"
              >
                <p className="text-sm text-zinc-400">Announcements</p>

                <p className="mt-1 text-2xl font-bold">
                  {announcementsThisMonth}
                </p>

                <p className="mt-3 text-xs font-semibold text-zinc-500">
                  Manage announcements →
                </p>
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-bold">{creator.display_name}</h2>

                  {creator.is_verified ? (
                    <span className="rounded-full bg-green-950 px-3 py-1 text-xs font-semibold text-green-400">
                      ✓ Verified
                    </span>
                  ) : verificationRequest ? (
                    <span className="rounded-full bg-yellow-950 px-3 py-1 text-xs font-semibold text-yellow-400 capitalize">
                      {verificationRequest.status}
                    </span>
                  ) : (
                    <Link
                      href="/verification-request"
                      className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
                    >
                      Request verification
                    </Link>
                  )}

                  {creator.niche && (
                    <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-300">
                      {creator.niche}
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm text-zinc-400">@{creator.username}</p>

                <p className="mt-3 max-w-2xl text-sm text-zinc-400">
                  {creator.bio ||
                    "Add a bio so visitors understand who you are and what you create."}
                </p>
              </div>

              <div className="grid shrink-0 gap-3 sm:grid-cols-2 lg:w-[360px]">
                <Link
                  href={`/creator/${creator.username}`}
                  className="rounded-2xl bg-white px-5 py-3 text-center font-semibold text-black transition hover:bg-zinc-200"
                >
                  View Storefront
                </Link>

                <Link
                  href="/edit-profile"
                  className="rounded-2xl border border-zinc-700 px-5 py-3 text-center font-semibold transition hover:bg-zinc-800"
                >
                  Edit Profile
                </Link>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_1.2fr]">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-sm text-zinc-500">Setup</p>
                <p className="mt-1 text-xl font-bold">
                  {completedCount}/{checklistItems.length}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-sm text-zinc-500">Completion</p>
                <p className="mt-1 text-xl font-bold">
                  {Math.round((completedCount / checklistItems.length) * 100)}%
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSetupSteps(!showSetupSteps)}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-left hover:border-zinc-600"
              >
                <p className="text-sm text-zinc-500">Checklist</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {showSetupSteps ? "Hide steps ↑" : "Show steps ↓"}
                </p>
              </button>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full bg-white"
                style={{
                  width: `${(completedCount / checklistItems.length) * 100}%`,
                }}
              />
            </div>

            {showSetupSteps && (
              <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="mb-3 text-sm font-semibold text-white">
                  Missing setup steps:
                </p>

                <div className="grid gap-2 md:grid-cols-2">
                  {checklistItems
                    .filter((item) => !item.complete)
                    .map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="rounded-xl border border-zinc-800 px-3 py-2 text-sm text-zinc-400 hover:border-zinc-600 hover:text-white"
                      >
                        {item.label} →
                      </Link>
                    ))}

                  {checklistItems.every((item) => item.complete) && (
                    <p className="text-sm text-green-400">Everything is complete.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Recent Activity</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Latest announcements, revenue updates, and notifications.
                </p>
              </div>

              <Link
                href="/notifications"
                className="text-sm font-semibold text-zinc-300 hover:text-white"
              >
                View all →
              </Link>
            </div>

            {recentActivity.length === 0 ? (
              <p className="text-sm text-zinc-400">No recent activity yet.</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <Link
                    key={activity.id}
                    href={activity.href}
                    className="block rounded-2xl border border-zinc-800 bg-zinc-950 p-3 hover:border-zinc-600"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs ${
                            activity.type === "Announcement"
                              ? "bg-blue-950 text-blue-400"
                              : activity.type === "Revenue"
                              ? "bg-green-950 text-green-400"
                              : "bg-purple-950 text-purple-400"
                          }`}
                        >
                          {activity.type}
                        </span>

                        <h3 className="mt-2 font-semibold">
                          {activity.title}
                        </h3>

                        <p className="mt-1 text-sm text-zinc-500">
                          {activity.description}
                        </p>
                      </div>

                      <p className="shrink-0 text-xs text-zinc-500">
                        {formatDate(activity.date)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">Featured Product</h2>

                  <p className="mt-2 text-sm text-zinc-400">
                    Highlight one product on your storefront.
                  </p>

                  <p className="mt-2 text-xs text-zinc-500">
                    Current:{" "}
                    {products.find(
                      (product) => product.id === creator.featured_product_id
                    )?.title || "No featured product selected"}
                  </p>
                </div>

                <Link
                  href="/dashboard/products"
                  className="text-sm font-semibold text-zinc-300 hover:text-white"
                >
                  Manage →
                </Link>
              </div>

              {products.length === 0 ? (
                <p className="text-sm text-zinc-400">
                  Add a product before choosing a featured item.
                </p>
              ) : (
                <div className="space-y-3">
                  {[
                    ...products.filter(
                      (product) => product.id === creator.featured_product_id
                    ),
                    ...products.filter(
                      (product) => product.id !== creator.featured_product_id
                    ),
                  ]
                    .slice(0, 3)
                    .map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold">{product.title}</p>

                            {creator.featured_product_id === product.id && (
                              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">
                                Featured
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-sm text-zinc-500">
                            {product.views || 0} views ·{" "}
                            {product.favorites_count || 0} favorites
                          </p>
                        </div>

                        <button
                          onClick={async () => {
                            const newFeaturedProductId =
                              creator.featured_product_id === product.id
                                ? null
                                : product.id;

                            const { error } = await supabase
                              .from("creators")
                              .update({
                                featured_product_id: newFeaturedProductId,
                              })
                              .eq("id", creator.id);

                            if (!error) {
                              setCreator({
                                ...creator,
                                featured_product_id: newFeaturedProductId,
                              });
                            }
                          }}
                          className={
                            creator.featured_product_id === product.id
                              ? "rounded-xl bg-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-300 hover:bg-zinc-700"
                              : "rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                          }
                        >
                          {creator.featured_product_id === product.id
                            ? "Remove Featured"
                            : "Set Featured"}
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="mb-5">
                <h2 className="text-2xl font-bold">Creator Goals</h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Milestones that help your creator business grow.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    label: "Publish 1 announcement",
                    complete: announcements.length >= 1,
                    progress: `${announcements.length}/1`,
                  },
                  {
                    label: "Reach 10 followers",
                    complete: totalFollowers >= 10,
                    progress: `${totalFollowers}/10`,
                  },
                  {
                    label: "Add 10 products",
                    complete: products.length >= 10,
                    progress: `${products.length}/10`,
                  },
                  {
                    label: "Track $10,000 revenue",
                    complete: totalRevenue >= 10000,
                    progress: `${formatCurrency(totalRevenue)} / $10,000`,
                  },
                  {
                    label: "Complete profile setup",
                    complete: completedCount === checklistItems.length,
                    progress: `${completedCount}/${checklistItems.length}`,
                  },
                ].map((goal) => (
                  <div
                    key={goal.label}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                          goal.complete
                            ? "bg-green-950 text-green-400"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {goal.complete ? "✓" : "•"}
                      </span>

                      <p className="font-semibold">{goal.label}</p>
                    </div>

                    <p className="shrink-0 text-sm text-zinc-400">{goal.progress}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}