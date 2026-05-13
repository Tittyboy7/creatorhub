import Link from "next/link";

export default function CreatorCard({ creator }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
      <div className="h-32 bg-zinc-800 rounded-2xl mb-4 flex items-center justify-center text-zinc-500">
        Profile Image
      </div>

      <h2 className="text-2xl font-semibold">
        {creator.displayName}
      </h2>

      <p className="text-zinc-400 mt-2">
        {creator.niche}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-zinc-500">
          {creator.followers} followers
        </p>

        <Link
          href={`/creator/${creator.username}`}
          className="bg-white text-black px-4 py-2 rounded-xl font-semibold"
        >
         View Profile
        </Link>
      </div>
    </div>
  );
}