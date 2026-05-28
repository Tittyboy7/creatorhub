import Link from "next/link";

export default function CreatorCard({ creator }) {
  return (
    <Link
      href={`/creator/${creator.username}`}
      className="block bg-zinc-900 border border-zinc-800 rounded-3xl p-6 transition duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:shadow-2xl"
    >
      {creator.banner_url ? (
        <img
          src={creator.banner_url}
          alt={`${creator.display_name} banner`}
          className="h-32 w-full object-cover rounded-2xl mb-4"
        />
      ) : (
        <div className="h-32 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl mb-4 flex items-center justify-center text-zinc-500">
          Banner Image
        </div>
      )}

      <div className="flex items-center gap-4 mb-4">
        {creator.avatar_url ? (
          <img
            src={creator.avatar_url}
            alt={`${creator.display_name} avatar`}
            className="w-16 h-16 object-cover rounded-full border-2 border-zinc-800"
          />
        ) : (
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500">
            Avatar
          </div>
        )}

        <div>
          <h2 className="text-2xl font-semibold">
            {creator.display_name}
          </h2>

          <p className="text-zinc-500">
            @{creator.username}
          </p>
        </div>
      </div>

      {creator.niche && (
        <span className="inline-block mb-4 bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm">
          {creator.niche}
        </span>
      )}

      <div className="mt-4 flex items-center justify-between">
        <p className="text-zinc-500">
          {creator.followers || 0} followers
        </p>

        <div className="bg-white text-black px-4 py-2 rounded-xl font-semibold">
          View Profile
        </div>
      </div>
    </Link>
  );
}