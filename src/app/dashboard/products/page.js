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
      .update({
        is_active: !product.is_active,
      })
      .eq("id", product.id);

    if (error) {
      alert(error.message);
      return;
    }

    setProducts((currentProducts) =>
      currentProducts.map((currentProduct) =>
        currentProduct.id === product.id
          ? { ...currentProduct, is_active: !product.is_active }
          : currentProduct
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

    setProducts((currentProducts) =>
      currentProducts.filter((product) => product.id !== productId)
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-5 py-8 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold">
              Product Management
            </h1>

            <p className="text-zinc-400 mt-3">
              Manage products for {creator?.display_name}.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="border border-zinc-700 px-5 py-3 rounded-2xl hover:bg-zinc-800 transition"
            >
              Back to Dashboard
            </Link>

            <Link
              href="/add-product"
              className="bg-white text-black px-5 py-3 rounded-2xl font-semibold hover:bg-zinc-200 transition"
            >
              Add Product
            </Link>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-3">
              No products yet
            </h2>

            <p className="text-zinc-400 mb-6">
              Add your first product to start building your storefront.
            </p>

            <Link
              href="/add-product"
              className="inline-block bg-white text-black px-6 py-3 rounded-2xl font-semibold hover:bg-zinc-200 transition"
            >
              Add Product
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className={`bg-zinc-900 border rounded-3xl p-5 md:p-6 ${
                  product.is_active
                    ? "border-zinc-800"
                    : "border-red-900 opacity-80"
                }`}
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

                <h3 className="text-xl font-semibold">
                  {product.title}
                </h3>

                <div className="flex flex-wrap gap-2 mt-3">
                  {!product.is_active && (
                    <span className="bg-red-950 text-red-400 px-3 py-1 rounded-full text-sm">
                      Hidden
                    </span>
                  )}

                  {product.category && (
                    <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm">
                      {product.category}
                    </span>
                  )}
                </div>

                {product.description && (
                  <p className="text-zinc-400 mt-3 line-clamp-2">
                    {product.description}
                  </p>
                )}

                <p className="text-2xl font-bold mt-4">
                  {product.price}
                </p>

                <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                  <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3">
                    <p className="font-bold">{product.views || 0}</p>
                    <p className="text-zinc-500 text-xs">Views</p>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3">
                    <p className="font-bold">{product.favorites_count || 0}</p>
                    <p className="text-zinc-500 text-xs">Favorites</p>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3">
                    <p className="font-bold">{product.checkout_clicks || 0}</p>
                    <p className="text-zinc-500 text-xs">Checkouts</p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <Link
                    href={`/edit-product/${product.id}`}
                    className="w-full bg-white text-black py-3 rounded-2xl font-semibold flex items-center justify-center hover:bg-zinc-200 transition"
                  >
                    Edit Product
                  </Link>

                  <Link
                    href={`/product/${product.id}`}
                    className="w-full border border-zinc-700 text-zinc-300 py-3 rounded-2xl hover:bg-zinc-800 flex items-center justify-center transition"
                  >
                    View Product
                  </Link>

                  <button
                    onClick={() => handleToggleProductActive(product)}
                    className="w-full border border-zinc-700 text-zinc-300 py-3 rounded-2xl hover:bg-zinc-800 flex items-center justify-center transition"
                  >
                    {product.is_active ? "Hide Product" : "Unhide Product"}
                  </button>

                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="w-full border border-red-900 text-red-400 py-3 rounded-2xl hover:bg-red-950 flex items-center justify-center transition"
                  >
                    Delete Product
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}