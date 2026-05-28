"use client";

import { supabase } from "@/lib/supabase";
import { getAccentButtonClass } from "@/lib/accentColors";

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
      className={`block w-full text-center py-3 rounded-2xl font-semibold cursor-pointer ${getAccentButtonClass(
        accentColor
      )}`}
    >
      Buy Now
    </button>
  );
}