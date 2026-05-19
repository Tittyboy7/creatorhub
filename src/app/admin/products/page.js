"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminProductsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadAdminProducts() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (!profile?.is_admin) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);

      const { data } = await supabase
        .from("products")
        .select(`
          *,
          creators (
            display_name,
            username
          )
        `)
        .order("created_at", { ascending: false });

      setProducts(data || []);
      setLoading(false);
    }

    loadAdminProducts();
  }, [router]);

  async function handleToggleProduct(product) {
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
          ? {
              ...currentProduct,
              is_active: !currentProduct.is_active,
            }
          : currentProduct
      )
    );

    window.dispatchEvent(new Event("cartUpdated"));
  }

  async function handleToggleFlag(product) {
    const { error } = await supabase
      .from("products")
      .update({
        is_flagged: !product.is_flagged,
      })
      .eq("id", product.id);

    if (error) {
      alert(error.message);
      return;
    }

    setProducts((currentProducts) =>
      currentProducts.map((currentProduct) =>
        currentProduct.id === product.id
          ? {
              ...currentProduct,
              is_flagged: !currentProduct.is_flagged,
            }
          : currentProduct
      )
    );
  }

  const filteredProducts = products.filter((product) => {
    const searchText = search.toLowerCase();

    return (
      product.title?.toLowerCase().includes(searchText) ||
      product.category?.toLowerCase().includes(searchText) ||
      product.creators?.display_name
        ?.toLowerCase()
        .includes(searchText) ||
      (searchText === "hidden" && !product.is_active) ||
      (searchText === "flagged" && product.is_flagged)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-10">
        <h1 className="text-4xl font-bold">Access denied</h1>
        <p className="text-zinc-400 mt-4">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-10">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/admin"
          className="inline-block mb-8 border border-zinc-700 px-5 py-3 rounded-2xl hover:bg-zinc-800"
        >
          Back to Admin
        </Link>

        <h1 className="text-5xl font-bold mb-4">Admin Products</h1>

        <p className="text-zinc-400 text-lg mb-8">
          Review all marketplace products.
        </p>

        <input
          type="text"
          placeholder="Search products, categories, creators, hidden, flagged..."
          className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4 mb-6"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <p className="text-zinc-400 mb-6">
          Showing {filteredProducts.length} product
          {filteredProducts.length === 1 ? "" : "s"}
        </p>

        {filteredProducts.length === 0 ? (
          <p className="text-zinc-400">No products found.</p>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`bg-zinc-900 border rounded-3xl p-6 ${
                  product.is_active
                    ? "border-zinc-800"
                    : "border-red-900 opacity-70"
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

                <h2 className="text-2xl font-semibold">{product.title}</h2>

                {!product.is_active && (
                  <span className="inline-block mt-3 bg-red-950 text-red-400 px-3 py-1 rounded-full text-sm">
                    Hidden
                  </span>
                )}

                {product.is_flagged && (
                  <span className="inline-block mt-3 ml-2 bg-yellow-950 text-yellow-400 px-3 py-1 rounded-full text-sm">
                    Flagged
                  </span>
                )}

                {product.creators && (
                  <Link
                    href={`/creator/${product.creators.username}`}
                    className="block mt-3 text-zinc-400 hover:text-white"
                  >
                    Sold by {product.creators.display_name}
                  </Link>
                )}

                {product.category && (
                  <p className="text-zinc-500 mt-3">
                    Category: {product.category}
                  </p>
                )}

                <p className="text-2xl font-bold mt-4">{product.price}</p>

                <div className="text-zinc-500 mt-4 space-y-1">
                  <p>{product.views || 0} views</p>
                  <p>{product.favorites_count || 0} favorites</p>
                  <p>{product.checkout_clicks || 0} checkout clicks</p>
                </div>

                <div className="mt-5 space-y-3">
                  <Link
                    href={`/product/${product.id}`}
                    className="w-full bg-white text-black py-3 rounded-2xl font-semibold flex items-center justify-center"
                  >
                    View Product
                  </Link>

                  {product.creators && (
                    <Link
                      href={`/creator/${product.creators.username}`}
                      className="w-full border border-zinc-700 py-3 rounded-2xl flex items-center justify-center"
                    >
                      View Creator
                    </Link>
                  )}

                  <button
                    onClick={() => handleToggleProduct(product)}
                    className={`w-full py-3 rounded-2xl font-semibold flex items-center justify-center ${
                      product.is_active
                        ? "border border-red-900 text-red-400 hover:bg-red-950"
                        : "bg-white text-black"
                    }`}
                  >
                    {product.is_active ? "Hide Product" : "Restore Product"}
                  </button>

                  <button
                    onClick={() => handleToggleFlag(product)}
                    className={`w-full py-3 rounded-2xl font-semibold flex items-center justify-center ${
                      product.is_flagged
                        ? "bg-white text-black"
                        : "border border-yellow-900 text-yellow-400 hover:bg-yellow-950"
                    }`}
                  >
                    {product.is_flagged ? "Unflag Product" : "Flag Product"}
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