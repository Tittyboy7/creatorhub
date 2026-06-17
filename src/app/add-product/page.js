"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import SuspendedAccountMessage from "@/components/SuspendedAccountMessage";

function formatPreviewPrice(value) {
  if (!value) return "$0";

  const cleanedValue = String(value).replace(/[^0-9.-]/g, "");
  const numberValue = Number(cleanedValue);

  if (Number.isNaN(numberValue)) {
    return value;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(numberValue);
}

export default function AddProductPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSuspended, setIsSuspended] = useState(false);

  useEffect(() => {
    async function checkSuspension() {
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
      }
 
      setLoading(false);
    }
 
    checkSuspension();
  }, [router]);

  if (loading) {
    return (
      <div className="p-10 text-zinc-400">
        Loading...
      </div>
    );
  }

  if (isSuspended) {
    return <SuspendedAccountMessage />;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter a product title.");
      return;
    }

    if (!price.trim()) {
      alert("Please enter a price.");
      return;
    }

    if (!category) {
      alert("Please select a category.");
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

    let imageUrl = "";

    if (image) {
      const filePath = `${user.id}/${Date.now()}-${image.name}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, image);

      if (uploadError) {
        alert(uploadError.message);
        setIsSubmitting(false);
        return;
      }

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      imageUrl = data.publicUrl;
    }

    const { error } = await supabase.from("products").insert({
      creator_id: creator.id,
      title: title.trim(),
      price: price.trim(),
      category,
      description: description.trim(),
      image_url: imageUrl,
      external_url: externalUrl.trim(),
    });

    if (error) {
      alert(error.message);
      setIsSubmitting(false);
    } else {
      alert("Product added!");
      router.push("/dashboard/products");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-5 py-8 text-white md:p-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <Link
          href="/dashboard/products"
          className="inline-block rounded-2xl border border-zinc-700 px-5 py-3 hover:bg-zinc-800"
        >
          Back to Products
        </Link>

        <section className="rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6 shadow-2xl md:p-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Storefront Inventory
          </p>

          <h1 className="text-4xl font-bold md:text-5xl">
            Add Product
          </h1>

          <p className="mt-4 max-w-3xl text-zinc-400">
            Add a product, service, digital download, offer, or external checkout
            link to your creator storefront.
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
                  Product Title
                </label>

                <input
                  type="text"
                  placeholder="Product Title"
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 p-4"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-400">
                  Price
                </label>

                <input
                  type="text"
                  placeholder="Price, e.g. $25"
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 p-4"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-400">
                  Category
                </label>

                <select
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 p-4"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Select Category</option>
                  <option value="Pokémon Cards">Pokémon Cards</option>
                  <option value="Digital Products">Digital Products</option>
                  <option value="Merch">Merch</option>
                  <option value="Collectibles">Collectibles</option>
                  <option value="Courses">Courses</option>
                  <option value="Coaching">Coaching</option>
                  <option value="Apparel">Apparel</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-400">
                  Description
                </label>

                <textarea
                  placeholder="Describe what buyers will receive..."
                  className="h-40 w-full rounded-2xl border border-zinc-700 bg-zinc-800 p-4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-400">
                  External Checkout URL
                </label>

                <input
                  type="url"
                  placeholder="https://..."
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 p-4"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                />

                <p className="mt-2 text-sm text-zinc-500">
                  Optional. Add a Shopify, eBay, Etsy, Gumroad, Patreon, or other checkout link.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-400">
                  Product Image
                </label>

                <input
                  type="file"
                  accept="image/*"
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 p-4"
                  onChange={(e) => setImage(e.target.files[0])}
                />

                {image && (
                  <p className="mt-2 text-sm text-zinc-500">
                    Selected: {image.name}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-white py-4 font-semibold text-black hover:bg-zinc-200 disabled:opacity-50"
              >
                {isSubmitting ? "Adding Product..." : "Add Product"}
              </button>
            </div>
          </form>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Live Preview
              </p>

              <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
                <h2 className="text-2xl font-bold">
                  Product Checklist
                </h2>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Title</span>
                    <span>{title ? "✓" : "○"}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Price</span>
                    <span>{price ? "✓" : "○"}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Category</span>
                    <span>{category ? "✓" : "○"}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Description</span>
                    <span>{description ? "✓" : "○"}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Image</span>
                    <span>{image ? "✓" : "○"}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Checkout URL</span>
                    <span>{externalUrl ? "✓" : "○"}</span>
                  </div>
                </div>
              </div>

              <p className="mb-4 text-sm text-zinc-500">
                This preview updates as you fill out the product form.
              </p>

              <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
                <div className="flex h-52 items-center justify-center bg-zinc-900 text-zinc-500">
                  {image ? (
                    <img
                      src={URL.createObjectURL(image)}
                      alt="Product preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    "Product Image"
                  )}
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-bold">
                    {title || "Product Title"}
                  </h3>

                  <p className="mt-2 text-2xl font-bold">
                    {formatPreviewPrice(price)}
                  </p>

                  {category && (
                    <span className="mt-3 inline-block rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
                      {category}
                    </span>
                  )}

                  <p className="mt-4 line-clamp-3 text-sm text-zinc-400">
                    {description || "Product description preview will appear here."}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-2xl font-bold">
                External checkout ready
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                CreatorsHub can act as the central storefront while purchases happen
                through Shopify, Gumroad, Etsy, eBay, Patreon, or another checkout provider.
              </p>
            </div>

            <Link
              href="/dashboard/products"
              className="block rounded-3xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-zinc-600 hover:bg-zinc-800"
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Product Manager
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                View Products
              </h2>

              <p className="mt-3 text-sm text-zinc-400">
                Return to your product library, performance stats, and storefront controls.
              </p>
            </Link>
          </aside>
        </section>
      </div>
    </div>
  );
}