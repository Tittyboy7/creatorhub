import CreatorCard from "@/components/CreatorCard";
import creators from "@/data/creators";

export default function CreatorPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-10">
      <h1 className="text-5xl font-bold mb-8">
        Creator Profiles
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        {creators.map((creator, index) => (
          <CreatorCard
            key={index}
            creator={creator}
          />
  ))}
      </div>
    </div>
  );
}