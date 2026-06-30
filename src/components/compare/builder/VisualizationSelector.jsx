import BuilderSection from "./BuilderSection";

export default function VisualizationSelector({
  chartType,
  setChartType,
  validChartTypes = [],
}) {
  return (
    <BuilderSection
      title="3. Recommended visualization"
      description="Options update based on what you are measuring and comparing."
    >
      <div className="grid grid-cols-2 gap-3">
        {validChartTypes.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setChartType(type)}
            className={`rounded-2xl border p-4 text-left ${
              chartType === type
                ? "border-white bg-white text-black"
                : "border-zinc-700 bg-zinc-950 text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            <p className="text-sm font-bold capitalize">
              {type === "bar"
                ? "📊 Bar"
                : type === "pie"
                ? "🥧 Pie"
                : type === "line"
                ? "📈 Line"
                : "🌊 Area"}
            </p>

            <p className="mt-1 text-xs opacity-70">
              {type === "bar"
                ? "Compare categories."
                : type === "pie"
                ? "Show share of a total."
                : type === "line"
                ? "Track changes over time."
                : "Show trend volume."}
            </p>
          </button>
        ))}
      </div>
    </BuilderSection>
  );
}