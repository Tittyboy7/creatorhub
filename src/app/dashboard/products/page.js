"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardProductsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [creator, setCreator] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function loadProducts() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: creatorData } = await supabase
        .from("creators")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!creatorData) {
        router.push("/create-profile");
        return;
      }

      setCreator(creatorData);

      const { data: productData, error } = await supabase
        .from("products")
        .select("*")
        .eq("creator_id", creatorData.id)
        .order("title", { ascending: true });

      if (error) {
        alert(error.message);
      } else {
        setProducts(productData || []);
      }

      setLoading(false);
    }

    loadProducts();
  }, [router]);

  async function handleToggleProductActive(product) {
    const { error } = await supabase
      .from("products")
      .update({ is_active: !product.is_active })
      .eq("id", product.id);

    if (error) {
      alert(error.message);
      return;
    }

    setProducts((current) =>
      current.map((item) =>
        item.id === product.id
          ? { ...item, is_active: !product.is_active }
          : item
      )
    );

    window.dispatchEvent(new Event("cartUpdated"));
  }

  async function handleDeleteProduct(productId) {
    const confirmed = confirm(
      "Are you sure you want to permanently delete this product?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      alert(error.message);
      return;
    }

    setProducts((current) =>
      current.filter((product) => product.id !== productId)
    );
  }

  if (loading) {
    return <p className="text-zinc-400">Loading products...</p>;
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold">Products</h2>
          <p className="mt-2 text-zinc-400">
            Manage products for {creator?.display_name}.
          </p>
        </div>

        <Link
          href="/add-product"
          className="rounded-xl bg-white px-5 py-3 text-center font-semibold text-black hover:bg-zinc-200"
        >
          Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <h3 className="text-xl font-bold">No products yet</h3>

          <p className="mt-2 text-zinc-400">
            Add your first product to start building your storefront.
          </p>

          <Link
            href="/add-product"
            className="mt-6 inline-block rounded-xl bg-white px-5 py-3 font-semibold text-black hover:bg-zinc-200"
          >
            Add your first product
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className={`rounded-2xl border bg-zinc-900 p-4 ${
                product.is_active
                  ? "border-zinc-800"
                  : "border-red-900 opacity-80"
              }`}
            >
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="mb-4 h-40 w-full rounded-xl object-cover"
                />
              ) : (
                <div className="mb-4 flex h-40 items-center justify-center rounded-xl bg-zinc-800 text-zinc-500">
                  Product Image
                </div>
              )}

              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{product.title}</h3>

                  <p className="mt-1 text-xl font-bold">
                    {product.price}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs ${
                    product.is_active
                      ? "bg-green-950 text-green-400"
                      : "bg-red-950 text-red-400"
                  }`}
                >
                  {product.is_active ? "Active" : "Hidden"}
                </span>
              </div>

              {product.category && (
                <span className="mt-3 inline-block rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
                  {product.category}
                </span>
              )}

              {product.description && (
                <p className="mt-3 line-clamp-2 text-sm text-zinc-400">
                  {product.description}
                </p>
              )}

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                  <p className="font-bold">{product.views || 0}</p>
                  <p className="text-xs text-zinc-500">Views</p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                  <p className="font-bold">{product.favorites_count || 0}</p>
                  <p className="text-xs text-zinc-500">Favorites</p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                  <p className="font-bold">{product.checkout_clicks || 0}</p>
                  <p className="text-xs text-zinc-500">Checkouts</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Link
                  href={`/edit-product/${product.id}`}
                  className="rounded-xl bg-white px-4 py-2 text-center text-sm font-semibold text-black hover:bg-zinc-200"
                >
                  Edit
                </Link>

                <Link
                  href={`/product/${product.id}`}
                  className="rounded-xl border border-zinc-700 px-4 py-2 text-center text-sm text-zinc-300 hover:bg-zinc-800"
                >
                  View
                </Link>

                <button
                  onClick={() => handleToggleProductActive(product)}
                  className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                >
                  {product.is_active ? "Hide" : "Unhide"}
                </button>

                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className="rounded-xl border border-red-900 px-4 py-2 text-sm text-red-400 hover:bg-red-950"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}