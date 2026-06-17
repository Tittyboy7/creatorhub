"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import SuspendedAccountMessage from "@/components/SuspendedAccountMessage";

export default function AddAnnouncementPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSuspended, setIsSuspended] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }
 
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
 
      const { data: creator } = await supabase
        .from("creators")
        .select("*")
        .eq("user_id", user.id)
        .single();
 
      if (!creator) {
        setLoading(false);
        return;
      }
 
      const { data: productData } = await supabase
        .from("products")
        .select("id, title")
        .eq("creator_id", creator.id)
        .eq("is_active", true)
        .order("title", { ascending: true });
 
      setProducts(productData || []);
      setLoading(false);
    }
 
    loadProducts();
  }, [router]);

  if (loading) {
    return <p className="text-zinc-400">Loading...</p>;
  }

  if (isSuspended) {
    return <SuspendedAccountMessage />;
  }

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
      is_active: true,
      admin_hidden: false,
    });

    if (error) {
      alert(error.message);
      setIsSubmitting(false);
    } else {
      alert("Announcement posted!");
      router.push("/dashboard/announcements");
    }
  }

  const selectedProduct = products.find(
    (product) => String(product.id) === String(selectedProductId)
  );

  return (
    <div className="min-h-screen bg-zinc-950 px-5 py-8 text-white md:p-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <Link
          href="/dashboard/announcements"
          className="inline-block rounded-2xl border border-zinc-700 px-5 py-3 hover:bg-zinc-800"
        >
          Back to Announcements
        </Link>

        <section className="rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6 shadow-2xl md:p-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Audience Updates
          </p>

          <h1 className="text-4xl font-bold md:text-5xl">
            Add Announcement
          </h1>

          <p className="mt-4 max-w-3xl text-zinc-400">
            Share product drops, news, creator updates, launches, or important
            storefront announcements with your audience.
          </p>
        </section>
                <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
          >
            <div className="grid gap-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-400">
                  Announcement Title
                </label>

                <input
                  type="text"
                  placeholder="New drop, creator update, launch announcement..."
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 p-4"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-400">
                  Announcement Details
                </label>

                <textarea
                  placeholder="Share the details of your announcement..."
                  className="h-40 w-full rounded-2xl border border-zinc-700 bg-zinc-800 p-4"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-400">
                  Linked Product
                </label>

                <select
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 p-4"
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

                <p className="mt-2 text-sm text-zinc-500">
                  Optional. Link a product if this announcement is about a drop,
                  restock, launch, or featured offer.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-white py-4 font-semibold text-black hover:bg-zinc-200 disabled:opacity-50"
              >
                {isSubmitting ? "Posting..." : "Post Announcement"}
              </button>
            </div>
          </form>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Live Preview
              </p>

              <p className="mb-4 text-sm text-zinc-500">
                This preview updates as you write your announcement.
              </p>

              <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
                <span className="inline-block rounded-full bg-blue-950 px-3 py-1 text-sm text-blue-400">
                  Announcement
                </span>

                <h2 className="mt-4 text-2xl font-bold">
                  {title || "Announcement Title"}
                </h2>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-400">
                  {content ||
                    "Your announcement details will appear here as you type."}
                </p>

                {selectedProduct && (
                  <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Linked Product
                    </p>

                    <p className="mt-2 font-semibold">
                      {selectedProduct.title}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-2xl font-bold">
                Announcement Checklist
              </h2>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>Title</span>
                  <span>{title ? "✓" : "○"}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Details</span>
                  <span>{content ? "✓" : "○"}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Linked Product</span>
                  <span>{selectedProductId ? "✓" : "○"}</span>
                </div>
              </div>
            </div>

            <Link
              href="/dashboard/announcements"
              className="block rounded-3xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-zinc-600 hover:bg-zinc-800"
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Announcement Manager
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                View Announcements
              </h2>

              <p className="mt-3 text-sm text-zinc-400">
                Return to your announcement library, status filters, and storefront updates.
              </p>
            </Link>
          </aside>
        </section>
      </div>
    </div>
  );
}