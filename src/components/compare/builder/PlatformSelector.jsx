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

  return (
    <BuilderSection
      title="5. Which platforms should be included?"
      description="Choose the platforms this widget should display. Leave all selected for a complete comparison."
    >
      <div className="grid grid-cols-2 gap-3">
        {platforms.map((platform) => {
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