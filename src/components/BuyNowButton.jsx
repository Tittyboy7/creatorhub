"use client";

import { supabase } from "@/lib/supabase";

export default function BuyNowButton({
  productId,
  externalUrl,
  accentColor = "white",
}) {
  async function handleClick() {
    await supabase.rpc("increment_checkout_clicks", {
      product_id_input: productId,
    });

    if (externalUrl) {
      window.open(externalUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`block w-full text-center py-3 rounded-2xl font-semibold cursor-pointer ${
        accentColor === "blue"
          ? "bg-blue-500 text-white hover:bg-blue-600"
          : accentColor === "purple"
          ? "bg-purple-500 text-white hover:bg-purple-600"
          : accentColor === "green"
          ? "bg-green-500 text-white hover:bg-green-600"
          : accentColor === "pink"
          ? "bg-pink-500 text-white hover:bg-pink-600"
          : accentColor === "orange"
          ? "bg-orange-500 text-white hover:bg-orange-600"
          : accentColor === "red"
          ? "bg-red-500 text-white hover:bg-red-600"
          : "bg-white text-black hover:bg-zinc-200"
      }`}
    >
      Buy Now
    </button>
  );
}