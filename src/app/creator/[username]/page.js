import { formatDate } from "@/lib/formatDate";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import FollowButton from "@/components/FollowButton";
import BuyNowButton from "@/components/BuyNowButton";
import {
  getAccentBadgeClass,
  getAccentBorderClass,
} from "@/lib/accentColors";

export const dynamic = "force-dynamic";

export default async function CreatorProfilePage({ params }) {
  const { username } = await params;

  const { data: creator } = await supabase
    .from("creators")
    .select("*")
    .eq("username", username)
    .single();

  if (!creator) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white px-5 py-8 md:p-10">
        <h1 className="text-4xl font-bold">Creator not found</h1>
      </div>
    );
  }

  const { data: creatorProducts } = await supabase
    .from("products")
    .select("*")
    .eq("creator_id", creator.id)
    .eq("is_active", true);

    const featuredProduct = (creatorProducts || []).find(
      (product) => product.id === creator.featured_product_id
    );

    const regularProducts = (creatorProducts || []).filter(
      (product) => product.id !== creator.featured_product_id
    );

  const { data: announcements } = await supabase
    .from("announcements")
    .select(`
      *,
      products (
        id,
        title
      )
    `)
    .eq("creator_id", creator.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-5 py-8 md:p-10">
      <div className="max-w-4xl mx-auto">
        {creator.banner_url ? (
          <div className="relative mb-8">
            <img
              src={creator.banner_url}
              alt={`${creator.display_name} banner`}
              className="h-80 w-full object-cover rounded-3xl border border-zinc-800 shadow-2xl"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20 rounded-3xl" />

            <div className="absolute bottom-8 left-8 z-10">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                {creator.avatar_url ? (
                  <img
                    src={creator.avatar_url}
                    alt={`${creator.display_name} avatar`}
                    className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-full border-4 border-zinc-950"
                  />
                ) : (
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-zinc-700 rounded-full flex items-center justify-center text-zinc-400 border-4 border-zinc-950">
                    Avatar
                  </div>
                )}

                <div>
                  <h1 className="text-3xl md:text-5xl font-bold flex items-center gap-2">
                    {creator.display_name}

                    {creator.is_verified && (
                      <span className="text-blue-400 text-2xl md:text-4xl">
                        ✓
                      </span>
                    )}
                  </h1>

                  <p className="text-zinc-300 mt-2">
                    @{creator.username}
                  </p>

                  {creator.niche && (
                    <span className="inline-block mt-3 bg-zinc-900/80 text-zinc-200 px-3 py-1 rounded-full text-sm">
                      {creator.niche}
                    </span>
                  )}

                  <p className="text-zinc-400 text-sm mt-2">
                    {(creatorProducts || []).length} Product
                    {(creatorProducts || []).length === 1 ? "" : "s"} •{" "}
                    {announcements?.length || 0} Announcement
                    {(announcements?.length || 0) === 1 ? "" : "s"}
                  </p>

                  <FollowButton creatorId={creator.id} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative h-80 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-3xl mb-8 border border-zinc-800 shadow-2xl">
            <div className="absolute inset-0 flex items-center justify-center text-zinc-600">
              Banner Image
            </div>

            <div className="absolute bottom-8 left-8 z-10">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                {creator.avatar_url ? (
                  <img
                    src={creator.avatar_url}
                    alt={`${creator.display_name} avatar`}
                    className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-full border-4 border-zinc-950"
                  />
                ) : (
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-zinc-700 rounded-full flex items-center justify-center text-zinc-400 border-4 border-zinc-950">
                    Avatar
                  </div>
                )}

                <div>
                  <h1 className="text-3xl md:text-5xl font-bold flex items-center gap-2">
                    {creator.display_name}

                    {creator.is_verified && (
                      <span className="text-blue-400 text-2xl md:text-4xl">
                        ✓
                      </span>
                    )}
                  </h1>

                  <p className="text-zinc-300 mt-2">
                    @{creator.username}
                  </p>

                  {creator.niche && (
                    <span className="inline-block mt-3 bg-zinc-900/80 text-zinc-200 px-3 py-1 rounded-full text-sm">
                      {creator.niche}
                    </span>
                  )}

                  <p className="text-zinc-400 text-sm mt-2">
                    {(creatorProducts || []).length} Product
                    {(creatorProducts || []).length === 1 ? "" : "s"} •{" "}
                    {announcements?.length || 0} Announcement
                    {(announcements?.length || 0) === 1 ? "" : "s"}
                  </p>

                  <FollowButton creatorId={creator.id} />
                </div>
              </div>
            </div>
          </div>
        )}
        {announcements && announcements.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-10">
            <h2 className="text-2xl font-semibold mb-4">
              Announcements
            </h2>

            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="border border-zinc-800 rounded-2xl p-4"
                >
                  <h3 className="text-xl font-semibold">
                    {announcement.title}
                  </h3>

                  <p className="text-zinc-500 text-sm mt-1">
                    {formatDate(announcement.created_at)}
                  </p>

                  {announcement.content && (
                    <p className="text-zinc-400 mt-2">
                      {announcement.content}
                    </p>
                  )}
                  {announcement.products && (
                    <>
                      <span className="inline-block mt-4 bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm">
                        Linked Product
                      </span>

                      <Link
                        href={`/product/${announcement.products.id}`}
                        className="block mt-3 bg-white text-black px-5 py-3 rounded-2xl font-semibold text-center"
                      >
                        View Product: {announcement.products.title}
                      </Link>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-10">
          <h2 className="text-2xl font-semibold mb-4">
            About
          </h2>

          <p className="text-zinc-400 leading-relaxed">
            {creator.bio}
          </p>

          {creator.social_links && (
            <div className="flex flex-wrap gap-3 mt-6">
              {creator.social_links.youtube && (
                <a
                  href={creator.social_links.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-zinc-700 px-4 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
                >
                  YouTube
                </a>
              )}

              {creator.social_links.tiktok && (
                <a
                  href={creator.social_links.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-zinc-700 px-4 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
                >
                  TikTok
                </a>
              )}

              {creator.social_links.instagram && (
                <a
                  href={creator.social_links.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-zinc-700 px-4 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
                >
                  Instagram
                </a>
              )}

              {creator.social_links.shopify && (
                <a
                  href={creator.social_links.shopify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-zinc-700 px-4 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
                >
                  Shopify
                </a>
              )}

              {creator.social_links.patreon && (
                <a
                  href={creator.social_links.patreon}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-zinc-700 px-4 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
                >
                  Patreon
                </a>
              )}
            </div>
          )}
        </div>

        {featuredProduct && (
          <div 
            className={`bg-gradient-to-br from-zinc-900 to-zinc-950 border rounded-3xl p-8 mb-10 shadow-2xl ${getAccentBorderClass(
              creator.accent_color
            )}`}
         >
          <span
            className={`inline-block mb-4 px-4 py-2 rounded-full text-sm font-semibold ${getAccentBadgeClass(
              creator.accent_color
            )}`}
          >
            ⭐ Creator Pick
          </span>

            {creator.featured_product_message && (
              <p className="text-zinc-300 mb-4 text-lg">
                {creator.featured_product_message}
              </p>
            )}

            {featuredProduct.image_url ? (
              <img
                src={featuredProduct.image_url}
                alt={featuredProduct.title}
                className="h-72 w-full object-cover rounded-2xl mb-6"
              />
            ) : (
              <div className="h-56 bg-zinc-800 rounded-2xl mb-4 flex items-center justify-center text-zinc-500">
                Product Image
              </div>
            )}

            <Link
              href={`/product/${featuredProduct.id}`}
              className="block text-3xl font-bold hover:text-zinc-300"
            >
              {featuredProduct.title}
            </Link>

            {featuredProduct.description && (
              <p className="text-zinc-400 mt-3">
                {featuredProduct.description}
              </p>
            )}

            <p className="text-2xl font-bold mt-4">
              {featuredProduct.price}
            </p>

            <BuyNowButton
              productId={featuredProduct.id}
              externalUrl={featuredProduct.external_url}
              accentColor={creator.accent_color}
            />
          </div>
        )}

        <div>
          <h2 className="text-3xl font-bold mb-6">
            Products
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-6">
            {regularProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-zinc-900 border border-zinc-800 rounded-3xl p-4 md:p-6 transition duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:shadow-2xl"
              >
                <Link href={`/product/${product.id}`} className="block">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="h-32 md:h-48 w-full object-cover rounded-2xl mb-4 transition duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="h-40 bg-zinc-800 rounded-2xl mb-4 flex items-center justify-center text-zinc-500">
                      Product Image
                    </div>
                  )}

                  <h3 className="text-xl md:text-2xl font-semibold hover:text-zinc-300">
                    {product.title}
                  </h3>

                  {product.category && (
                    <span className="inline-block mt-3 bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm">
                      {product.category}
                    </span>
                  )}

                  {product.description && (
                    <p className="text-zinc-400 mt-2">
                      {product.description}
                    </p>
                  )}

                  <p className="text-xl font-bold mt-4">
                    {product.price}
                  </p>

                  <p className="text-zinc-500 mt-4 font-medium group-hover:text-white transition">
                    View Product →
                  </p>

                  {product.reviews_count > 0 && (
                    <p className="text-zinc-500 mt-2">
                      ⭐ {Number(product.average_rating).toFixed(1)} / 5 ·{" "}
                      {product.reviews_count} review
                      {product.reviews_count === 1 ? "" : "s"}
                    </p>
                  )}
                </Link>

                <BuyNowButton
                  productId={product.id}
                  externalUrl={product.external_url}
                />
              </div>
            ))}
          </div>

          <div className="mt-12 bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Like this creator’s work?
            </h2>

            <p className="text-zinc-400 mb-6">
              Follow their storefront to keep up with new products and announcements.
            </p>

            <FollowButton creatorId={creator.id} />
          </div>
        </div>
      </div>
    </div>
  );
}