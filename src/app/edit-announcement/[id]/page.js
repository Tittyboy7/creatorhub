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
        router.push("/dashboard/announcements");
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
          .eq("is_active", true)
          .order("title", { ascending: true });

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
      router.push("/dashboard/announcements");
    }
  }

  const selectedProduct = products.find(
    (product) => String(product.id) === String(selectedProductId)
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        Loading announcement...
      </div>
    );
  }

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
            Edit Announcement
          </h1>

          <p className="mt-4 max-w-3xl text-zinc-400">
            Update a storefront announcement, product drop, creator update, or linked product message.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <form
            onSubmit={handleUpdate}
            className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
          >
            <div className="grid gap-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-400">
                  Announcement Title
                </label>

                <input
                  type="text"
                  placeholder="Announcement Title"
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
                  placeholder="Announcement details..."
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
                  <option value="">No linked product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.title}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-white py-4 font-semibold text-black hover:bg-zinc-200 disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Announcement"}
              </button>
            </div>
          </form>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Live Preview
              </p>

              <p className="mb-4 text-sm text-zinc-500">
                This preview updates as you edit your announcement.
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