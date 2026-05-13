"use client";

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
      }

      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  async function handleDeleteProduct(productId) {
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
                {creator.display_name}
              </h2>
              <p className="text-zinc-400 mb-2">@{creator.username}</p>
              <p className="text-zinc-400 mb-6">{creator.bio}</p>

              <div className="flex gap-4">
                <Link
                  href="/add-product"
                  className="bg-white text-black px-6 py-3 rounded-2xl font-semibold"
                >
                  Add Product
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
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-6">Your Products</h2>

              {products.length === 0 ? (
                <p className="text-zinc-400">No products yet.</p>
              ) : (
                <div className="grid md:grid-cols-3 gap-6">
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

                      <div className="mt-4 space-y-3">
                        <Link
                          href={`/edit-product/${product.id}`}
                          className="block w-full text-center bg-white text-black py-3 rounded-2xl font-semibold"
                        >
                          Edit Product
                        </Link>

                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="w-full border border-red-900 text-red-400 py-3 rounded-2xl hover:bg-red-950"
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