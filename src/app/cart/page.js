"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import BuyNowButton from "@/components/BuyNowButton";

export default function CartPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    async function loadCart() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          id,
          products (
            id,
            title,
            price,
            description,
            image_url,
            external_url,
            is_active,
            creators (
              display_name,
              username
            )
          )
        `)
        .eq("user_id", user.id);

      if (error) {
        alert(error.message);
      } else {
        setCartItems(
          (data || []).filter((item) => item.products?.is_active)
        );
      }

      setLoading(false);
    }

    loadCart();
  }, [router]);

  async function removeFromCart(cartItemId) {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", cartItemId);

    if (error) {
      alert(error.message);
    } else {
      setCartItems((items) =>
        items.filter((item) => item.id !== cartItemId)
      );
      window.dispatchEvent(new Event("cartUpdated"));
    }
  }

  const total = cartItems.reduce((sum, item) => {
    const priceNumber = Number(
      item.products?.price?.replace(/[^0-9.]/g, "") || 0
    );

    return sum + priceNumber;
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-bold mb-4">Purchase List</h1>

        <p className="text-zinc-400 text-lg mb-6">
          Products you’re considering purchasing from creator storefronts.
        </p>

        <div className="flex flex-wrap gap-3 mb-10">
          <Link
            href="/store"
            className="bg-white text-black px-5 py-3 rounded-2xl font-semibold hover:bg-zinc-200 transition"
          >
            Browse Marketplace
          </Link>

          <Link
            href="/favorites"
            className="border border-zinc-700 px-5 py-3 rounded-2xl hover:bg-zinc-800 transition"
          >
            View Favorites
          </Link>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Your Purchase List is Empty
            </h2>

            <p className="text-zinc-400 text-lg">
              Save products here before purchasing them from creators.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <Link
                href="/store"
                className="bg-white text-black px-6 py-3 rounded-2xl font-semibold hover:bg-zinc-200 transition"
              >
                Browse Marketplace
              </Link>

              <Link
                href="/favorites"
                className="border border-zinc-700 px-6 py-3 rounded-2xl hover:bg-zinc-800 transition"
              >
                View Favorites
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {cartItems.map((item) => {
              const product = item.products;

              if (!product) return null;

              return (
                <div
                  key={item.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col lg:flex-row gap-6 hover:border-zinc-700 transition"
                >
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-full lg:w-56 h-48 object-cover rounded-2xl"
                    />
                  ) : (
                    <div className="w-full lg:w-56 h-48 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500">
                      Product Image
                    </div>
                  )}

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <Link
                        href={`/product/${product.id}`}
                        className="block text-3xl font-bold hover:text-zinc-300 transition"
                      >
                        {product.title}
                      </Link>

                      {product.creators && (
                        <Link
                          href={`/creator/${product.creators.username}`}
                          className="inline-block mt-3 text-zinc-400 hover:text-white"
                        >
                          Sold by {product.creators.display_name}
                        </Link>
                      )}

                      {product.description && (
                        <p className="text-zinc-400 mt-4 leading-relaxed">
                          {product.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-6">
                      <p className="text-3xl font-bold mb-5">
                        {product.price}
                      </p>

                      <div className="flex flex-wrap gap-3">
                        <div className="w-full md:w-auto">
                          <BuyNowButton
                            productId={product.id}
                            externalUrl={product.external_url}
                          />
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="border border-red-900 text-red-400 px-5 py-3 rounded-2xl hover:bg-red-950 transition"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
              <div className="flex items-center justify-between gap-6 flex-wrap">
                <div>
                  <p className="text-zinc-400 text-lg">
                    Estimated Total
                  </p>

                  <p className="text-5xl font-bold mt-2">
                    ${total.toFixed(2)}
                  </p>
                </div>

                <div className="max-w-md">
                  <p className="text-zinc-300 leading-relaxed">
                    CreatorHub does not process checkout directly.
                    Purchases are completed through each creator’s
                    external storefront.
                  </p>

                  <p className="text-zinc-500 text-sm mt-3">
                    Use your purchase list to organize products you
                    plan to buy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}