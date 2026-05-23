"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AddToCartButton({ productId }) {
  const [user, setUser] = useState(null);
  const [cartItemId, setCartItemId] = useState(null);

  useEffect(() => {
    async function loadCartStatus() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      if (!user) return;

      const { data } = await supabase
        .from("cart_items")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .maybeSingle();

      if (data) {
        setCartItemId(data.id);
      }
    }

    loadCartStatus();
  }, [productId]);

  async function createCartNotification() {
    const { data: product } = await supabase
      .from("products")
      .select(`
        id,
        title,
        creator_id,
        creators (
          id,
          user_id
        )
      `)
      .eq("id", productId)
      .single();

    const creatorUserId = product?.creators?.user_id;

    if (!creatorUserId || creatorUserId === user.id) {
      return;
    }

    const { data: preferences } = await supabase
      .from("notification_preferences")
      .select("cart_activity")
      .eq("user_id", creatorUserId)
      .maybeSingle();

    if (preferences?.cart_activity !== false) {
      await supabase.from("notifications").insert({
        user_id: creatorUserId,
        creator_id: product.creator_id,
        title: "Product Added to Cart",
        message: `Someone added your product to their cart: ${product.title}`,
      });
    }
  }

  async function handleAddToCart() {
    if (!user) {
      alert("Please log in to add items to cart.");
      return;
    }

    if (cartItemId) {
      alert("This product is already in your cart.");
      return;
    }

    const { data, error } = await supabase
      .from("cart_items")
      .insert({
        user_id: user.id,
        product_id: productId,
      })
      .select()
      .single();

    if (error) {
      alert(error.message);
    } else {
      await createCartNotification();

      setCartItemId(data.id);
      window.dispatchEvent(new Event("cartUpdated"));
    }
  }

  return (
    <button
      onClick={handleAddToCart}
      className="mt-4 w-full border border-zinc-700 py-3 rounded-2xl"
    >
      {cartItemId ? "In Cart" : "Add to Cart"}
    </button>
  );
}