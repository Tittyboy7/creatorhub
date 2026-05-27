"use client";

import { supabase } from "@/lib/supabase";

export default function BuyNowButton({ productId, externalUrl }) {
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
      className="relative z-10 block w-full text-center bg-white text-black py-3 rounded-2xl font-semibold cursor-pointer hover:bg-zinc-200"
    >
      Buy Now
    </button>
  );
}