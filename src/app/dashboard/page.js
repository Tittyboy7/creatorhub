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
      }

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
      label: "Profile image added",
      complete: !!creator?.avatar_url,
    },
    {
      label: "Banner image added",
      complete: !!creator?.banner_url,
    },
    {
      label: "Bio added",
      complete: !!creator?.bio,
    },
    {
      label: "Niche added",
      complete: !!creator?.niche,
    },
    {
      label: "At least 1 product added",
      complete: products.length > 0,
    },
    {
      label: "At least 1 social link added",
      complete: hasSocialLinks,
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
    <div className="min-h-screen bg-zinc-950 text-white p-10">
      <div className="max-w-6xl mx-auto space-y-10">
        <div>
          <h1 className="text-5xl font-bold mb-4">Creator Dashboard</h1>
          <p className="text-zinc-400 text-lg">Welcome back, {user?.email}</p>
        </div>

        {creator && (
          <div className="grid md:grid-cols-7 gap-6">
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
              <p className="text-4xl font-bold mt-2">
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
              Profile Completion
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

                <Link
                  href="/add-revenue"
                  className="bg-white text-black px-6 py-3 rounded-2xl font-semibold"
                >
                  Add Revenue
                </Link>

                <Link
                  href="/revenue"
                  className="border border-zinc-700 px-6 py-3 rounded-2xl"
                >
                  View Revenue
                </Link>
              </div>
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