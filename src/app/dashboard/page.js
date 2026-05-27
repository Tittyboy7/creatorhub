"use client";

import { formatDate } from "@/lib/formatDate";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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

  function getTypeBadgeClass(type) {
    switch (type) {
      case "follow":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/30";

      case "favorite":
        return "bg-pink-500/10 text-pink-400 border border-pink-500/30";

      case "review":
        return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30";

      case "cart":
        return "bg-green-500/10 text-green-400 border border-green-500/30";

      case "revenue":
        return "bg-purple-500/10 text-purple-400 border border-purple-500/30";

      default:
        return "bg-zinc-800 text-zinc-300";
      }
    }

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
    <div className="min-h-screen bg-zinc-950 text-white p-10">
      <div className="max-w-6xl mx-auto space-y-10">
        <div>
          <h1 className="text-5xl font-bold mb-4">Creator Dashboard</h1>
          <p className="text-zinc-400 text-lg">Welcome back, {user?.email}</p>
        </div>

        {creator && (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
              <p className="text-zinc-400">Products</p>
              <p className="text-4xl font-bold mt-2">{products.length}</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
              <p className="text-zinc-400">Total Views</p>
              <p className="text-4xl font-bold mt-2">{totalViews}</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
              <p className="text-zinc-400">Total Favorites</p>
              <p className="text-4xl font-bold mt-2">{totalFavorites}</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
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

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
              <p className="text-zinc-400">Followers</p>
              <p className="text-4xl font-bold mt-2">{totalFollowers}</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
              <p className="text-zinc-400">Checkout Clicks</p>
              <p className="text-4xl font-bold mt-2">
                {totalCheckoutClicks}
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
              <p className="text-zinc-400">Total Revenue</p>
              <p className="text-2xl font-bold mt-2 break-words">
                ${totalRevenue.toFixed(2)}
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
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
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <h2 className="text-3xl font-bold mb-2">
              Getting Started
            </h2>

            <p className="text-zinc-400 mb-6">
              {completedCount} of {checklistItems.length} tasks completed
            </p>

            <div className="space-y-3">
              {checklistItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3"
                >
                  <span className="text-xl">
                    {item.complete ? "✅" : "⬜"}
                  </span>

                  <span
                    className={
                      item.complete
                        ? "text-white"
                        : "text-zinc-400"
                    }
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-4 flex-wrap mt-8">
              <Link
                href="/edit-profile"
                className="bg-white text-black px-6 py-3 rounded-2xl font-semibold"
              >
                Edit Profile
              </Link>

              <Link
                href="/add-product"
                className="border border-zinc-700 px-6 py-3 rounded-2xl"
              >
                Add Product
              </Link>

              <Link
                href="/add-announcement"
                className="border border-zinc-700 px-6 py-3 rounded-2xl"
              >
                Add Announcement
              </Link>
            </div>
          </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
              <h2 className="text-3xl font-bold mb-2">
                {creator.display_name}
              </h2>

              <p className="text-zinc-400 mb-2">@{creator.username}</p>

              {creator.niche && (
                <span className="inline-block mb-4 bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm">
                  {creator.niche}
                </span>
              )}

              <p className="text-zinc-400 mb-6">{creator.bio}</p>

              <div className="flex gap-4 flex-wrap">
                <Link
                  href="/add-product"
                  className="bg-white text-black px-6 py-3 rounded-2xl font-semibold"
                >
                  Add Product
                </Link>

                <Link
                  href="/add-announcement"
                  className="bg-white text-black px-6 py-3 rounded-2xl font-semibold"
                >
                  Add Announcement
                </Link>

                <Link
                  href="/edit-profile"
                  className="border border-zinc-700 px-6 py-3 rounded-2xl"
                >
                  Edit Profile
                </Link>

                <Link
                  href={`/creator/${creator.username}`}
                  className="border border-zinc-700 px-6 py-3 rounded-2xl"
                >
                  View Storefront
                </Link>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
                <div>
                  <h2 className="text-3xl font-bold">
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

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold">
                  Recent Announcements
                </h2>

                <Link
                  href="/add-announcement"
                  className="bg-white text-black px-5 py-3 rounded-2xl font-semibold"
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

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <h2 className="text-3xl font-bold">
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
                        className={`inline-block mt-2 px-3 py-1 rounded-full text-xs ${getTypeBadgeClass(
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

<div>
  <h2 className="text-3xl font-bold mb-6">
    Your Announcements
  </h2>

  {announcements.length === 0 ? (
    <p className="text-zinc-400">
      No announcements yet.
    </p>
  ) : (
    <div className="space-y-6">
      {announcements.map((announcement) => (
        <div
          key={announcement.id}
          className={`bg-zinc-900 border rounded-3xl p-6 ${
            announcement.is_active
              ? "border-zinc-800"
              : "border-red-900 opacity-70"
          }`}
        >
          <h3 className="text-2xl font-semibold">
            {announcement.title}
          </h3>

          <p className="text-zinc-500 text-sm mt-1">
            {formatDate(announcement.created_at)}
          </p>

          {announcement.products && (
            <span className="inline-block mt-3 bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm">
              Linked Product
            </span>
          )}

          {!announcement.is_active && (
            <span className="inline-block mt-3 bg-red-950 text-red-400 px-3 py-1 rounded-full text-sm">
              Hidden
            </span>
          )}

          {announcement.content && (
            <p className="text-zinc-400 mt-3">
              {announcement.content}
            </p>
          )}

          {announcement.products && (
            <Link
              href={`/product/${announcement.products.id}`}
              className="inline-block mt-4 text-zinc-400 hover:text-white"
            >
              Linked product: {announcement.products.title}
            </Link>
          )}

            <Link
              href={`/edit-announcement/${announcement.id}`}
              className="inline-block mt-4 mr-3 bg-white text-black px-5 py-3 rounded-2xl font-semibold"
            >
              Edit Announcement
            </Link>

          <button
            onClick={() =>
              handleToggleAnnouncementActive(announcement)
            }
            className="mt-4 mr-3 border border-zinc-700 text-zinc-300 px-5 py-3 rounded-2xl hover:bg-zinc-800"
          >
            {announcement.is_active
              ? "Hide Announcement"
              : "Unhide Announcement"}
          </button>

          <button
            onClick={() =>
              handleDeleteAnnouncement(
                announcement.id
              )
            }
            className="mt-4 border border-red-900 text-red-400 px-5 py-3 rounded-2xl hover:bg-red-950"
          >
            Delete Announcement
          </button>
        </div>
      ))}
    </div>
  )}
</div>

<div>
  <h2 className="text-3xl font-bold mb-6">
    Your Products
  </h2>

              {products.length === 0 ? (
                <p className="text-zinc-400">No products yet.</p>
              ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6"
                    >
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="h-40 w-full object-cover rounded-2xl mb-4"
                        />
                      ) : (
                        <div className="h-40 bg-zinc-800 rounded-2xl mb-4 flex items-center justify-center text-zinc-500">
                          Product Image
                        </div>
                      )}

                      <h3 className="text-xl font-semibold">{product.title}</h3>

                      {!product.is_active && (
                        <span className="inline-block mt-3 bg-red-950 text-red-400 px-3 py-1 rounded-full text-sm">
                          Hidden
                        </span>
                      )}

                      {product.category && (
                        <span className="inline-block mt-3 bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm">
                          {product.category}
                        </span>
                      )}

                      <p className="text-zinc-400 mt-2">
                        {product.description}
                      </p>

                      <p className="text-2xl font-bold mt-4">
                        {product.price}
                      </p>

                      <p className="text-zinc-500 mt-2">
                        {product.views || 0} views
                      </p>

                      <p className="text-zinc-500 mt-1">
                        {product.favorites_count || 0} favorites
                      </p>

                      <p className="text-zinc-500 mt-1">
                        {product.checkout_clicks || 0} checkout clicks
                      </p>

                      <div className="mt-4 space-y-3">
                        <Link
                          href={`/edit-product/${product.id}`}
                          className="w-full bg-white text-black py-3 rounded-2xl font-semibold flex items-center justify-center"
                        >
                          Edit Product
                        </Link>

                        <button
                          onClick={() => handleToggleProductActive(product)}
                          className="w-full border border-zinc-700 text-zinc-300 py-3 rounded-2xl hover:bg-zinc-800 flex items-center justify-center"
                        >
                          {product.is_active ? "Hide Product" : "Unhide Product"}
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="w-full border border-red-900 text-red-400 py-3 rounded-2xl hover:bg-red-950 flex items-center justify-center"
                        >
                          Delete Product
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}