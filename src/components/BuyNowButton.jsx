"use client";

import { supabase } from "@/lib/supabase";

export default function BuyNowButton({
  productId,
  externalUrl,
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
      className="block w-full rounded-2xl bg-white py-3 text-center font-semibold text-black transition hover:bg-zinc-200 cursor-pointer"
    >
      Buy Now
    </button>
  );
}