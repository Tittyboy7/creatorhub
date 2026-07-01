import BuilderSection from "./BuilderSection";

export default function PlatformSelector({
  platforms = [],
  selectedPlatforms = [],
  setSelectedPlatforms,
}) {
  function togglePlatform(platform) {
    setSelectedPlatforms((current) => {
      if (current.includes(platform)) {
        return current.filter((item) => item !== platform);
      }

      return [...current, platform];
    });
  }

    const sortedPlatforms = [...platforms].sort((a, b) => {
      const aSelected = selectedPlatforms.includes(a);
      const bSelected = selectedPlatforms.includes(b);

      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;

      return a.localeCompare(b);
    });

  return (
    <BuilderSection
      title="5. Which platforms should be included?"
      description="Choose the platforms this widget should display. Leave all selected for a complete comparison."
    >
    <div className="mb-3 flex gap-2">
      <button
        type="button"
        onClick={() => setSelectedPlatforms(platforms)}
        className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
      >
        Select all
      </button>

      <button
        type="button"
        onClick={() => setSelectedPlatforms([])}
        className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
      >
        Clear all
      </button>
    </div>

      <div className="grid grid-cols-2 gap-3">
        {sortedPlatforms.map((platform) => {
          const selected = selectedPlatforms.includes(platform);

          return (
            <button
              key={platform}
              type="button"
              onClick={() => togglePlatform(platform)}
              className={`rounded-2xl border p-3 text-left ${
                selected
                  ? "border-white bg-white text-black"
                  : "border-zinc-700 bg-zinc-950 text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              <p className="text-sm font-bold">{platform}</p>
              <p className="mt-1 text-xs opacity-70">
                {selected ? "Included" : "Excluded"}
              </p>
            </button>
          );
        })}
      </div>
    </BuilderSection>
  );
}