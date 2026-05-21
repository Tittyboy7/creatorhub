"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function FavoriteButton({ productId }) {
  const [user, setUser] = useState(null);
  const [favoriteId, setFavoriteId] = useState(null);

  useEffect(() => {
    async function loadFavorite() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      if (!user) return;

      const { data } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .maybeSingle();

      if (data) {
        setFavoriteId(data.id);
      }
    }

    loadFavorite();
  }, [productId]);

  async function createFavoriteNotification() {
    const { data: product } = await supabase
      .from("products")
      .select(`
        id,
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

    await supabase.from("notifications").insert({
      user_id: creatorUserId,
      creator_id: product.creator_id,
      title: "Product Favorited",
      message: "Someone saved one of your products.",
    });
  }

  async function toggleFavorite() {
    if (!user) {
      alert("Please log in to save favorites.");
      return;
    }

    const { data: product } = await supabase
      .from("products")
      .select("favorites_count")
      .eq("id", productId)
      .single();

    if (favoriteId) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("id", favoriteId);

      if (error) {
        alert(error.message);
        return;
      }

      await supabase
        .from("products")
        .update({
          favorites_count: Math.max(
            (product?.favorites_count || 0) - 1,
            0
          ),
        })
        .eq("id", productId);

      setFavoriteId(null);
    } else {
      const { data, error } = await supabase
        .from("favorites")
        .insert({
          user_id: user.id,
          product_id: productId,
        })
        .select()
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      await supabase
        .from("products")
        .update({
          favorites_count:
            (product?.favorites_count || 0) + 1,
        })
        .eq("id", productId);

      await createFavoriteNotification();

      setFavoriteId(data.id);
    }
  }

  return (
    <button
      onClick={toggleFavorite}
      className="mt-4 w-full border border-zinc-700 py-3 rounded-2xl"
    >
      {favoriteId ? "Saved ♥" : "Save ♡"}
    </button>
  );
}