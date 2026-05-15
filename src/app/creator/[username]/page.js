import Link from "next/link";
import { supabase } from "@/lib/supabase";
import FollowButton from "@/components/FollowButton";

export default async function CreatorProfilePage({ params }) {
  const { username } = await params;

  const { data: creator } = await supabase
    .from("creators")
    .select("*")
    .eq("username", username)
    .single();

  if (!creator) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-10">
        <h1 className="text-4xl font-bold">Creator not found</h1>
      </div>
    );
  }

  const { data: creatorProducts } = await supabase
    .from("products")
    .select("*")
    .eq("creator_id", creator.id);

  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .eq("creator_id", creator.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-10">
      <div className="max-w-4xl mx-auto">
        {creator.banner_url ? (
          <img
            src={creator.banner_url}
            alt={`${creator.display_name} banner`}
            className="h-64 w-full object-cover rounded-3xl mb-8"
          />
        ) : (
          <div className="h-64 bg-zinc-800 rounded-3xl mb-8 flex items-center justify-center text-zinc-500">
            Banner Image
          </div>
        )}

        <div className="flex items-center gap-6 mb-8">
          {creator.avatar_url ? (
            <img
              src={creator.avatar_url}
              alt={`${creator.display_name} avatar`}
              className="w-32 h-32 object-cover rounded-full"
            />
          ) : (
            <div className="w-32 h-32 bg-zinc-700 rounded-full flex items-center justify-center text-zinc-400">
              Avatar
            </div>
          )}

          <div>
            <h1 className="text-5xl font-bold">
              {creator.display_name}
            </h1>

            <p className="text-zinc-400 mt-2">
              @{creator.username}
            </p>

            {creator.niche && (
              <span className="inline-block mt-3 bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm">
                {creator.niche}
              </span>
            )}

            <FollowButton creatorId={creator.id} />
          </div>
        </div>

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

                  {announcement.content && (
                    <p className="text-zinc-400 mt-2">
                      {announcement.content}
                    </p>
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
                  className="border border-zinc-700 px-4 py-2 rounded-xl text-zinc-300 hover:text-white"
                >
                  YouTube
                </a>
              )}

              {creator.social_links.tiktok && (
                <a
                  href={creator.social_links.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-zinc-700 px-4 py-2 rounded-xl text-zinc-300 hover:text-white"
                >
                  TikTok
                </a>
              )}

              {creator.social_links.instagram && (
                <a
                  href={creator.social_links.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-zinc-700 px-4 py-2 rounded-xl text-zinc-300 hover:text-white"
                >
                  Instagram
                </a>
              )}

              {creator.social_links.shopify && (
                <a
                  href={creator.social_links.shopify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-zinc-700 px-4 py-2 rounded-xl text-zinc-300 hover:text-white"
                >
                  Shopify
                </a>
              )}

              {creator.social_links.patreon && (
                <a
                  href={creator.social_links.patreon}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-zinc-700 px-4 py-2 rounded-xl text-zinc-300 hover:text-white"
                >
                  Patreon
                </a>
              )}
            </div>
          )}
        </div>
                <div>
          <h2 className="text-3xl font-bold mb-6">
            Products
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {(creatorProducts || []).map((product) => (
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

                <Link
                  href={`/product/${product.id}`}
                  className="block text-2xl font-semibold hover:text-zinc-300"
                >
                  {product.title}
                </Link>

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

                {product.reviews_count > 0 && (
                  <p className="text-zinc-500 mt-2">
                    ⭐ {Number(product.average_rating).toFixed(1)} / 5 ·{" "}
                    {product.reviews_count} review
                    {product.reviews_count === 1 ? "" : "s"}
                  </p>
                )}

                {product.external_url ? (
                  <a
                    href={product.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 w-full bg-white text-black py-3 rounded-2xl font-semibold flex items-center justify-center"
                  >
                    Buy Now
                  </a>
                ) : (
                  <button
                    className="mt-4 w-full bg-white text-black py-3 rounded-2xl font-semibold flex items-center justify-center"
                  >
                    Buy Now
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}