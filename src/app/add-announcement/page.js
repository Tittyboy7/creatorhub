"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AddAnnouncementPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: creator } = await supabase
        .from("creators")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!creator) {
        return;
      }

      const { data: productData } = await supabase
        .from("products")
        .select("id, title")
        .eq("creator_id", creator.id)
        .eq("is_active", true);

      setProducts(productData || []);
    }

    loadProducts();
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter an announcement title.");
      return;
    }

    setIsSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in.");
      setIsSubmitting(false);
      return;
    }

    const { data: creator } = await supabase
      .from("creators")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!creator) {
      alert("You must create a creator profile first.");
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.from("announcements").insert({
      creator_id: creator.id,
      title: title.trim(),
      content: content.trim(),
      product_id: selectedProductId || null,
    });

    if (error) {
      alert(error.message);
      setIsSubmitting(false);
    } else {
      alert("Announcement posted!");
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 w-full max-w-xl">
        <h1 className="text-4xl font-bold mb-3">
          Add Announcement
        </h1>

        <p className="text-zinc-400 mb-8">
          Share an update with your storefront visitors.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
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
            <option value="">Optional: Link a product</option>
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
            {isSubmitting ? "Posting..." : "Post Announcement"}
          </button>
        </form>
      </div>
    </div>
  );
}