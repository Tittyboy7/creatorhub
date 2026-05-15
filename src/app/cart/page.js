"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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
            external_url
          )
        `);

      if (error) {
        alert(error.message);
      } else {
        setCartItems(data || []);
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
        <h1 className="text-5xl font-bold mb-4">Cart</h1>

        <p className="text-zinc-400 text-lg mb-10">
          Products you added to your cart.
        </p>

        {cartItems.length === 0 ? (
          <p className="text-zinc-400">Your cart is empty.</p>
        ) : (
          <div className="space-y-6">
            {cartItems.map((item) => {
              const product = item.products;

              if (!product) return null;

              return (
                <div
                  key={item.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col md:flex-row gap-6"
                >
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-full md:w-48 h-40 object-cover rounded-2xl"
                    />
                  ) : (
                    <div className="w-full md:w-48 h-40 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500">
                      Product Image
                    </div>
                  )}

                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold">
                      {product.title}
                    </h2>

                    {product.description && (
                      <p className="text-zinc-400 mt-2">
                        {product.description}
                      </p>
                    )}

                    <p className="text-2xl font-bold mt-4">
                      {product.price}
                    </p>

                    <div className="flex flex-wrap gap-3 mt-6">
                      {product.external_url && (
                        <a
                          href={product.external_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white text-black px-5 py-3 rounded-2xl font-semibold"
                        >
                          Buy Now
                        </a>
                      )}

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="border border-red-900 text-red-400 px-5 py-3 rounded-2xl hover:bg-red-950"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
              <p className="text-zinc-400">Estimated Total</p>

              <p className="text-4xl font-bold mt-2">
                ${total.toFixed(2)}
              </p>

              <p className="text-zinc-400 mt-4">
                Checkout is handled through each creator’s external store.
              </p>

              <p className="text-zinc-500 mt-2 text-sm">
                Click the Buy Now button on each cart item to complete your purchase.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}