"use client";

import { formatDate } from "@/lib/formatDate";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getAccentBadgeClass } from "@/lib/accentColors"

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
  const [featuredMessage, setFeaturedMessage] = useState("");
  const [verificationRequest, setVerificationRequest] = useState(null);

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

      const { data: creatorData } = await supabase
        .from("creators")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setCreator(creatorData);

      setFeaturedMessage(creatorData?.featured_product_message || "");

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

  async function handleDeleteProduct(productId) {
    const confirmed = confirm(
      "Are you sure you want to permanently delete this product?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      alert(error.message);
    } else {
      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== productId)
      );
    }
  }

  async function handleToggleAnnouncementActive(announcement) {
    const { error } = await supabase
      .from("announcements")
      .update({
        is_active: !announcement.is_active,
      })
      .eq("id", announcement.id);

    if (error) {
      alert(error.message);
    } else {
      setAnnouncements((currentAnnouncements) =>
        currentAnnouncements.map((currentAnnouncement) =>
          currentAnnouncement.id === announcement.id
            ? {
                ...currentAnnouncement,
                is_active: !announcement.is_active,
              }
            : currentAnnouncement
        )
      );
    }
  }

  async function handleToggleProductActive(product) {
    const { error } = await supabase
      .from("products")
      .update({
        is_active: !product.is_active,
      })
      .eq("id", product.id);

    if (error) {
      alert(error.message);
    } else {
      setProducts((currentProducts) =>
        currentProducts.map((currentProduct) =>
          currentProduct.id === product.id
            ? { ...currentProduct, is_active: !product.is_active }
            : currentProduct
        )
      );
      window.dispatchEvent(new Event("cartUpdated"));
    }
  }

  async function handleDeleteAnnouncement(announcementId) {
    const confirmed = confirm(
      "Are you sure you want to permanently delete this announcement?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", announcementId);

    if (error) {
      alert(error.message);
    } else {
      setAnnouncements((currentAnnouncements) =>
        currentAnnouncements.filter(
          (announcement) =>
            announcement.id !== announcementId
        )
      );
    }
  }

  const totalViews = products.reduce(
    (sum, product) => sum + (product.views || 0),
    0
  );

  const totalCheckoutClicks = products.reduce(
    (sum, product) => sum + (product.checkout_clicks || 0),
    0
  );

  const socialLinks = creator?.social_links || {};

  const hasSocialLinks = Object.values(socialLinks).some(
    (value) => value && value.trim() !== ""
  );

  const checklistItems = [
    {
      label: "Create your creator profile",
      complete: !!creator,
    },
    {
      label: "Add a profile image",
      complete: !!creator?.avatar_url,
    },
    {
      label: "Add a banner image",
      complete: !!creator?.banner_url,
    },
    {
      label: "Write a bio",
      complete: !!creator?.bio,
    },
    {
      label: "Choose your niche",
      complete: !!creator?.niche,
    },
    {
      label: "Add your first product",
      complete: products.length > 0,
    },
    {
      label: "Add at least one social link",
      complete: hasSocialLinks,
    },
    {
      label: "Publish your first announcement",
      complete: announcements.length > 0,
    },
  ];

  const completedCount = checklistItems.filter(
    (item) => item.complete
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-5 py-8 md:p-10">
      <div className="max-w-6xl mx-auto space-y-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Creator Dashboard</h1>
          <p className="text-zinc-400 text-lg">Welcome back, {user?.email}</p>
        </div>

        {creator && (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 md:p-6">
              <p className="text-zinc-400">Products</p>
              <p className="text-4xl font-bold mt-2">{products.length}</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 md:p-6">
              <p className="text-zinc-400">Total Views</p>
              <p className="text-4xl font-bold mt-2">{totalViews}</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 md:p-6">
              <p className="text-zinc-400">Total Favorites</p>
              <p className="text-4xl font-bold mt-2">{totalFavorites}</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 md:p-6">
              <p className="text-zinc-400">Average Rating</p>

              <p className="text-4xl font-bold mt-2">
                {products.length === 0
                  ? "0.0"
                  : (
                      products.reduce(
                        (sum, product) =>
                          sum + Number(product.average_rating || 0),
                        0
                      ) / products.length
                    ).toFixed(1)}
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 md:p-6">
              <p className="text-zinc-400">Followers</p>
              <p className="text-4xl font-bold mt-2">{totalFollowers}</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 md:p-6">
              <p className="text-zinc-400">Checkout Clicks</p>
              <p className="text-4xl font-bold mt-2">
                {totalCheckoutClicks}
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 md:p-6">
              <p className="text-zinc-400">Total Revenue</p>
              <p className="text-2xl font-bold mt-2 break-words">
                ${totalRevenue.toFixed(2)}
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 md:p-6">
              <p className="text-zinc-400">Revenue Entries</p>
              <p className="text-4xl font-bold mt-2">
                {revenueEntries.length}
              </p>
            </div>
          </div>
        )}

        {!creator ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <h2 className="text-3xl font-bold mb-4">
              Create your creator profile
            </h2>

            <p className="text-zinc-400 mb-6">
              You need a creator profile before you can add products.
            </p>

            <Link
              href="/create-profile"
              className="inline-block bg-white text-black px-6 py-3 rounded-2xl font-semibold"
            >
              Create Profile
            </Link>
          </div>
        ) : (
          <>
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8">
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">
          {creator.display_name}
        </h2>

        <p className="text-zinc-400 mb-4">
          @{creator.username}
        </p>

        <div className="flex flex-wrap gap-2 mb-5">
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getAccentBadgeClass(
              creator.accent_color
            )}`}
          >
            Accent: {creator.accent_color || "white"}
          </span>

          {creator.niche && (
            <span className="inline-block bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm">
              {creator.niche}
            </span>
          )}
        </div>

        <p className="text-zinc-400 max-w-2xl">
          {creator.bio || "Add a bio so visitors understand who you are and what you create."}
        </p>
      </div>

      <div className="flex flex-wrap gap-3 md:justify-end">
        <Link
          href={`/creator/${creator.username}`}
          className="bg-white text-black px-5 py-3 rounded-2xl font-semibold hover:bg-zinc-200 transition"
        >
          View Storefront
        </Link>

        <Link
          href="/edit-profile"
          className="border border-zinc-700 px-5 py-3 rounded-2xl hover:bg-zinc-800 transition"
        >
          Edit Profile
        </Link>
      </div>
    </div>

    <div className="grid sm:grid-cols-2 gap-3 mt-8">
      <Link
        href="/add-product"
        className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-600 transition"
      >
        <p className="font-semibold">
          Add Product
        </p>
        <p className="text-zinc-500 text-sm mt-1">
          List something new in your storefront.
        </p>
      </Link>

      <Link
        href="/add-announcement"
        className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-600 transition"
      >
        <p className="font-semibold">
          Add Announcement
        </p>
        <p className="text-zinc-500 text-sm mt-1">
          Share an update with your audience.
        </p>
      </Link>

      <Link
        href="/revenue"
        className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-600 transition"
      >
        <p className="font-semibold">
          Revenue
        </p>
        <p className="text-zinc-500 text-sm mt-1">
          Track creator income and sales.
        </p>
      </Link>

      <Link
        href="/notifications"
        className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-600 transition"
      >
        <p className="font-semibold">
          Notifications
        </p>
        <p className="text-zinc-500 text-sm mt-1">
          View recent activity.
        </p>
      </Link>
    </div>
  </div>

  <div className="space-y-6">
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
      <h2 className="text-2xl font-bold mb-3">
        Verification
      </h2>

      {creator.is_verified ? (
        <p className="text-green-400 font-semibold">
          ✓ Verified Creator
        </p>
      ) : verificationRequest ? (
        <p className="text-zinc-300">
          Current status:{" "}
          <span className="font-semibold capitalize">
            {verificationRequest.status}
          </span>
        </p>
      ) : (
        <>
          <p className="text-zinc-400 mb-4">
            Request verification to build trust with visitors.
          </p>

          <Link
            href="/verification-request"
            className="inline-block border border-zinc-700 px-5 py-3 rounded-2xl hover:bg-zinc-800 transition"
          >
            Request Verification
          </Link>
        </>
      )}
    </div>

    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="text-2xl font-bold">
          Setup Progress
        </h2>

        <span className="text-zinc-400 text-sm">
          {completedCount}/{checklistItems.length}
        </span>
      </div>

      <div className="space-y-3">
        {checklistItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 text-sm"
          >
            <span>
              {item.complete ? "✅" : "⬜"}
            </span>

            <span
              className={
                item.complete ? "text-white" : "text-zinc-400"
              }
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <p className="text-zinc-500 text-sm mt-4">
        Complete all setup steps to make your storefront more trustworthy.
      </p>
    </div>
  </div>
</div>

<div className="grid md:grid-cols-3 gap-6">
  <Link
    href="/dashboard/products"
    className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-600 transition"
  >
    <h2 className="text-2xl font-bold">
      Products
    </h2>

    <p className="text-zinc-400 mt-2">
      Manage listings, visibility, edits, and product performance.
    </p>
  </Link>

  <Link
    href="/add-announcement"
    className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-600 transition"
  >
    <h2 className="text-2xl font-bold">
      Announcements
    </h2>

    <p className="text-zinc-400 mt-2">
      Create updates and keep your followers informed.
    </p>
  </Link>

  <Link
    href="/revenue"
    className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-600 transition"
  >
    <h2 className="text-2xl font-bold">
      Revenue
    </h2>

    <p className="text-zinc-400 mt-2">
      Track income, platforms, and monthly performance.
    </p>
  </Link>
</div>

          <div className="grid lg:grid-cols-2 gap-6"> 
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold">
                    Featured Product Controls
                  </h2>

                  <p className="text-zinc-400 mt-2">
                    Choose one product to highlight at the top of your public storefront.
                  </p>
                </div>

                <Link
                  href="/add-product"
                  className="bg-white text-black px-5 py-3 rounded-2xl font-semibold"
                >
                  Add Product
                </Link>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 mb-6">
                <label className="block text-zinc-400 mb-2">
                  Featured product message
                </label>

                <input
                  type="text"
                  placeholder="Example: My newest launch, Best seller, Start here..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4 mb-4"
                  value={featuredMessage}
                  onChange={(e) => setFeaturedMessage(e.target.value)}
                />

                <button
                  onClick={async () => {
                    const { error } = await supabase
                      .from("creators")
                      .update({
                        featured_product_message: featuredMessage,
                      })
                      .eq("id", creator.id);

                    if (!error) {
                      setCreator({
                        ...creator,
                        featured_product_message: featuredMessage,
                      });
                    }
                  }}
                  className="bg-white text-black px-5 py-3 rounded-2xl font-semibold"
                >
                  Save Featured Message
                </button>
              </div>

              {products.length === 0 ? (
                <p className="text-zinc-400">
                  You have not added any products yet.
                </p>
              ) : (
                <div className="space-y-4">
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
                      className="border border-zinc-800 rounded-2xl p-5"
                    >
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                          <h3 className="text-xl font-semibold">
                            {product.title}
                          </h3>

                          {creator.featured_product_id === product.id && (
                            <span className="inline-block mt-2 bg-white text-black px-3 py-1 rounded-full text-xs font-semibold">
                              Featured
                            </span>
                          )}

                          {creator.featured_product_id === product.id &&
                            creator.featured_product_message && (
                              <p className="text-zinc-400 mt-2 text-sm">
                                {creator.featured_product_message}
                              </p>
                            )}

                          <p className="text-zinc-400 mt-1">
                            {product.views || 0} views ·{" "}
                            {product.favorites_count || 0} favorites
                          </p>
                        </div>

                        <div className="flex gap-3 flex-wrap">
                          <Link
                            href={`/product/${product.id}`}
                            className="border border-zinc-700 px-4 py-2 rounded-xl"
                          >
                            View Product
                          </Link>

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
                                ? "bg-white text-black px-4 py-2 rounded-xl font-semibold"
                                : "border border-zinc-700 px-4 py-2 rounded-xl"
                            }
                          >
                            {creator.featured_product_id === product.id
                              ? "Featured Product"
                              : "Set Featured"}
                          </button>

                          <Link
                            href={`/creator/${creator.username}`}
                            className="border border-zinc-700 px-4 py-2 rounded-xl"
                          >
                            Storefront
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="text-2xl md:text-3xl font-bold">
                  Recent Announcements
                </h2>

                <Link
                  href="/add-announcement"
                  className="w-full sm:w-auto text-center bg-white text-black px-5 py-3 rounded-2xl font-semibold hover:bg-zinc-200 transition"
                >
                  Add Announcement
                </Link>
              </div>

              {announcements.length === 0 ? (
                <p className="text-zinc-400">
                  You have not posted any announcements yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {announcements.slice(0, 3).map((announcement) => (
                    <div
                      key={announcement.id}
                      className="border border-zinc-800 rounded-2xl p-5"
                    >
                      <h3 className="text-xl font-semibold">
                        {announcement.title}
                      </h3>

                      <p className="text-zinc-500 text-sm mt-1">
                        {formatDate(announcement.created_at)}
                      </p>

                      {announcement.content && (
                        <p className="text-zinc-400 mt-2">
                          {announcement.content}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <h2 className="text-2xl md:text-3xl font-bold">
                  Recent Revenue
                </h2>

                <div className="flex gap-3 flex-wrap">
                  <Link
                    href="/add-revenue"
                    className="bg-white text-black px-5 py-3 rounded-2xl font-semibold"
                  >
                    Add Revenue
                  </Link>

                  <Link
                    href="/revenue"
                    className="border border-zinc-700 px-5 py-3 rounded-2xl"
                  >
                    View Revenue
                  </Link>
                </div>
              </div>
            </div>

              {revenueEntries.length === 0 ? (
                <p className="text-zinc-400">
                  You have not added any revenue entries yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {revenueEntries.slice(0, 3).map((entry) => (
                    <div
                      key={entry.id}
                      className="border border-zinc-800 rounded-2xl p-5"
                    >
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                          <h3 className="text-xl font-semibold">
                            {entry.platform}
                          </h3>

                          <p className="text-zinc-400 mt-1">
                            {entry.revenue_type} · {entry.entry_month}
                          </p>
                        </div>

                        <p className="text-2xl font-bold">
                          ${Number(entry.amount || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
              <h2 className="text-3xl font-bold mb-3">
                Notifications
              </h2>

              <p className="text-zinc-400 mb-6">
                View follows, favorites, reviews, cart activity, and revenue import alerts.
              </p>

              <div className="flex gap-4 flex-wrap">
                <Link
                  href="/notifications"
                  className="bg-white text-black px-6 py-3 rounded-2xl font-semibold inline-block"
                >
                  View Notifications
                </Link>

                <Link
                  href="/notification-preferences"
                  className="border border-zinc-700 px-6 py-3 rounded-2xl"
                >
                  Preferences
                </Link>
              </div>

              {notifications.length > 0 && (
                <div className="mt-6 space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`border rounded-2xl p-4 ${
                        notification.is_read
                          ? "border-zinc-800 opacity-70"
                          : "border-white"
                      }`}
                    >
                      <p className="font-semibold">
                        {notification.title}
                      </p>

                      <span
                        className={`inline-block mt-2 px-3 py-1 rounded-full text-xs ${getNotificationTypeClass(
                          notification.type
                        )}`}
                      >
                        {notification.type || "general"}
                      </span>

                      {notification.message && (
                        <p className="text-zinc-400 text-sm mt-1">
                          {notification.message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
              <h2 className="text-3xl font-bold mb-3">
                Revenue Tracking
              </h2>

              <p className="text-zinc-400 mb-6">
                Track income from Twitch, Kick, YouTube, products,
                sponsorships, and more.
              </p>

              <div className="flex gap-4 flex-wrap">
                <Link
                  href="/revenue"
                  className="bg-white text-black px-6 py-3 rounded-2xl font-semibold"
                >
                  View Revenue
                </Link>

                <Link
                  href="/add-revenue"
                  className="border border-zinc-700 px-6 py-3 rounded-2xl"
                >
                  Add Revenue
                </Link>

                <Link
                  href="/import-revenue"
                  className="border border-zinc-700 px-6 py-3 rounded-2xl"
                >
                  Import CSV
                </Link>
              </div>
            </div>

<div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h2 className="text-2xl md:text-3xl font-bold">
        Announcement Management
      </h2>

      <p className="text-zinc-400 mt-2">
        Manage your {announcements.length} announcement
        {announcements.length === 1 ? "" : "s"} from one dedicated page.
      </p>
    </div>

    <Link
      href="/dashboard/announcements"
      className="bg-white text-black px-5 py-3 rounded-2xl font-semibold text-center hover:bg-zinc-200 transition"
    >
      Manage Announcements
    </Link>
  </div>
</div>

<div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h2 className="text-2xl md:text-3xl font-bold">
        Product Management
      </h2>

      <p className="text-zinc-400 mt-2">
        Manage your {products.length} product
        {products.length === 1 ? "" : "s"} from one dedicated page.
      </p>
    </div>

    <Link
      href="/dashboard/products"
      className="bg-white text-black px-5 py-3 rounded-2xl font-semibold text-center hover:bg-zinc-200 transition"
    >
      Manage Products
    </Link>
  </div>
</div>
          </>
        )}
      </div>
    </div>
  );
}