"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") {
    return "$0.00";
  }

  const cleanedValue = String(value).replace(/[^0-9.-]/g, "");
  const numberValue = Number(cleanedValue);

  if (Number.isNaN(numberValue)) {
    return "$0.00";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(numberValue);
}

export default function DashboardProductsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [creator, setCreator] = useState(null);
  const [products, setProducts] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");

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

  const filteredProducts = products.filter((product) => {
    if (statusFilter === "Active") return product.is_active;
    if (statusFilter === "Hidden") return !product.is_active;
    return true;
  });

  if (loading) {
    return <p className="text-zinc-400">Loading products...</p>;
  }

  return (
    <div>
      <section className="mb-8 rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Storefront Inventory
            </p>

            <h2 className="text-3xl font-bold">Products</h2>

            <p className="mt-2 max-w-2xl text-zinc-400">
              Manage products, visibility, performance, and storefront listings for {creator?.display_name}.
            </p>
          </div>

          <Link
            href="/add-product"
            className="rounded-2xl bg-white px-5 py-3 text-center font-semibold text-black hover:bg-zinc-200"
          >
            Add Product
          </Link>
        </div>
      </section>
      
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Total Products</p>
          <p className="mt-2 text-3xl font-bold">{products.length}</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Active</p>
          <p className="mt-2 text-3xl font-bold">
            {products.filter((product) => product.is_active).length}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Hidden</p>
          <p className="mt-2 text-3xl font-bold">
            {products.filter((product) => !product.is_active).length}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Total Views</p>
          <p className="mt-2 text-3xl font-bold">
            {products.reduce((sum, product) => sum + Number(product.views || 0), 0)}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Inventory</p>

          <p className="mt-2 text-3xl font-bold">
            {products.reduce(
              (sum, product) => sum + Number(product.inventory || 0),
              0
            )}
          </p>
        </div>
      </div>

      {products.length > 0 && (
          <div className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="mb-5">
              <h3 className="text-2xl font-bold">Store Performance</h3>

              <p className="mt-1 text-sm text-zinc-500">
                A quick snapshot of how your products are performing.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-sm text-zinc-400">Views</p>
                <p className="mt-1 text-3xl font-bold">
                  {products.reduce((sum, product) => sum + Number(product.views || 0), 0)}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-sm text-zinc-400">Favorites</p>
                <p className="mt-1 text-3xl font-bold">
                  {products.reduce((sum, product) => sum + Number(product.favorites_count || 0), 0)}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-sm text-zinc-400">Checkout Clicks</p>
                <p className="mt-1 text-3xl font-bold">
                  {products.reduce((sum, product) => sum + Number(product.checkout_clicks || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        )}

      {products.length > 0 && (
        <div className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Top Product
              </p>

              <h3 className="mt-2 text-2xl font-bold">
                {
                  [...products].sort(
                    (a, b) =>
                      Number(b.checkout_clicks || 0) -
                      Number(a.checkout_clicks || 0)
                  )[0]?.title
                }
              </h3>

              <p className="mt-2 text-zinc-400">
                Highest checkout activity across your storefront.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4 text-center">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Checkout Clicks
              </p>

              <p className="mt-1 text-3xl font-bold">
                {
                  [...products].sort(
                    (a, b) =>
                      Number(b.checkout_clicks || 0) -
                      Number(a.checkout_clicks || 0)
                  )[0]?.checkout_clicks || 0
                }
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-2xl font-bold">Product Library</h3>

          <p className="mt-1 text-sm text-zinc-500">
            Edit, preview, hide, or remove products from your storefront.
          </p>

          <p className="mt-2 text-sm text-zinc-500">
            Showing {filteredProducts.length} product
            {filteredProducts.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {["All", "Active", "Hidden"].map((option) => (
            <button
              key={option}
              onClick={() => setStatusFilter(option)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                statusFilter === option
                  ? "border-white bg-white text-black"
                  : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <h3 className="text-xl font-bold">
            {products.length === 0 ? "No products yet" : "No matching products"}
          </h3>

          <p className="mt-2 text-zinc-400">
            {products.length === 0
              ? "Add your first product to start building your storefront."
              : "Try changing the product status filter."}
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
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`group rounded-3xl border bg-zinc-900 p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 ${
                product.is_active
                  ? "border-zinc-800 hover:border-zinc-600"
                  : "border-red-900 opacity-80 hover:border-red-700"
              }`}
            >
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="mb-4 h-40 w-full rounded-2xl object-cover transition duration-300 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="mb-4 flex h-40 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-500">
                  Product Image
                </div>
              )}

              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="line-clamp-2 text-lg font-semibold group-hover:text-zinc-300">
                    {product.title}
                  </h3>

                  <p className="mt-2 text-2xl font-bold">
                    {formatCurrency(product.price)}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
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

              <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl border border-zinc-800 bg-zinc-950 p-2 text-center">
                <div className="rounded-xl bg-zinc-900 p-3">
                  <p className="font-bold">{product.views || 0}</p>
                  <p className="text-xs text-zinc-500">Views</p>
                </div>

                <div className="rounded-xl bg-zinc-900 p-3">
                  <p className="font-bold">{product.favorites_count || 0}</p>
                  <p className="text-xs text-zinc-500">Favorites</p>
                </div>

                <div className="rounded-xl bg-zinc-900 p-3">
                  <p className="font-bold">{product.checkout_clicks || 0}</p>
                  <p className="text-xs text-zinc-500">Checkouts</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <Link
                  href={`/edit-product/${product.id}`}
                  className="rounded-2xl bg-white px-4 py-2 text-center text-sm font-semibold text-black transition hover:bg-zinc-200"
                >
                  Edit
                </Link>

                <Link
                  href={`/product/${product.id}`}
                  className="rounded-2xl border border-zinc-700 px-4 py-2 text-center text-sm text-zinc-300 transition hover:bg-zinc-800"
                >
                  View
                </Link>

                <button
                  onClick={() => handleToggleProductActive(product)}
                  className="rounded-2xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800"
                >
                  {product.is_active ? "Hide" : "Unhide"}
                </button>

                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className="rounded-2xl border border-red-900 px-4 py-2 text-sm text-red-400 transition hover:bg-red-950"
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