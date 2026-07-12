import PlatformCard from "./PlatformCard";

function getGridClass(count) {
  if (count <= 1) return "grid gap-3 lg:grid-cols-[minmax(0,420px)]";
  if (count === 2) return "grid gap-3 lg:grid-cols-2";
  return "grid gap-3 lg:grid-cols-3";
}

export default function PlatformGrid({ platforms }) {
  const gridClass = getGridClass(platforms.length);

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-bold text-white">Connected Platforms</h2>
        <p className="mt-1 text-sm text-zinc-500">
          A compact overview of each connected platform.
        </p>
      </div>

      <div className={gridClass}>
        {platforms.map((platform) => (
          <PlatformCard key={platform.key} platform={platform} />
        ))}
      </div>
    </section>
  );
}