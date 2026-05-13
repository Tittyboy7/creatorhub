import { supabase } from "@/lib/supabase";

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
            <h1 className="text-5xl font-bold">{creator.display_name}</h1>
            <p className="text-zinc-400 mt-2">@{creator.username}</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-10">
          <h2 className="text-2xl font-semibold mb-4">About</h2>
          <p className="text-zinc-400 leading-relaxed">{creator.bio}</p>
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-6">Products</h2>

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

                <h3 className="text-2xl font-semibold">{product.title}</h3>
                
                {product.category && (
                  <span className="inline-block mt-3 bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm">
                    {product.category}
                  </span>
                )}

                {product.description && (
                  <p className="text-zinc-400 mt-2">{product.description}</p>
                )}

                <div className="flex items-center justify-between mt-4">
                  <p className="text-xl font-bold">{product.price}</p>

                  {product.external_url ? (
                    <a
                      href={product.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white text-black px-4 py-2 rounded-xl font-semibold"
                    >
                      Buy Now
                    </a>
                  ) : (
                    <button className="bg-white text-black px-4 py-2 rounded-xl font-semibold">
                      Buy Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}