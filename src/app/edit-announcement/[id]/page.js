"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function EditAnnouncementPage() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");

  useEffect(() => {
    async function loadAnnouncement() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: announcement, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) {
        alert(error.message);
        router.push("/dashboard");
        return;
      }

      setTitle(announcement.title || "");
      setContent(announcement.content || "");
      setSelectedProductId(announcement.product_id || "");

      const { data: creator } = await supabase
        .from("creators")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (creator) {
        const { data: productData } = await supabase
          .from("products")
          .select("id, title")
          .eq("creator_id", creator.id)
          .eq("is_active", true);

        setProducts(productData || []);
      }

      setLoading(false);
    }

    loadAnnouncement();
  }, [params.id, router]);

  async function handleUpdate(e) {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter an announcement title.");
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase
      .from("announcements")
      .update({
        title: title.trim(),
        content: content.trim(),
        product_id: selectedProductId || null,
      })
      .eq("id", params.id);

    if (error) {
      alert(error.message);
      setIsSubmitting(false);
    } else {
      alert("Announcement updated!");
      router.push("/dashboard");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 w-full max-w-xl">
        <h1 className="text-4xl font-bold mb-3">Edit Announcement</h1>

        <p className="text-zinc-400 mb-8">
          Update your storefront announcement.
        </p>

        <Link
          href="/dashboard"
          className="inline-block mb-8 border border-zinc-700 px-5 py-3 rounded-2xl hover:bg-zinc-800"
        >
          Back to Dashboard
        </Link>

        <form onSubmit={handleUpdate} className="space-y-6">
          <input
            type="text"
            placeholder="Announcement Title"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="Announcement details..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4 h-40"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <select
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
          >
            <option value="">No linked product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.title}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-white text-black py-4 rounded-2xl font-semibold disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Announcement"}
          </button>
        </form>
      </div>
    </div>
  );
}