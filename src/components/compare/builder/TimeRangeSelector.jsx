import BuilderSection from "./BuilderSection";

const timeRanges = [
  { key: "today", label: "Today" },
  { key: "7d", label: "Last 7 Days" },
  { key: "30d", label: "Last 30 Days" },
  { key: "90d", label: "Last 90 Days" },
  { key: "12m", label: "Last 12 Months" },
  { key: "all", label: "All Time" },
];

export default function TimeRangeSelector({ timePeriod, setTimePeriod }) {
  return (
    <BuilderSection
      title="4. What time range?"
      description="Choose how much history this widget should include."
    >
      <div className="grid grid-cols-2 gap-3">
        {timeRanges.map((range) => (
          <button
            key={range.key}
            type="button"
            onClick={() => setTimePeriod(range.key)}
            className={`rounded-2xl border p-4 text-left ${
              timePeriod === range.key
                ? "border-white bg-white text-black"
                : "border-zinc-700 bg-zinc-950 text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            <p className="text-sm font-bold">{range.label}</p>
          </button>
        ))}
      </div>
    </BuilderSection>
  );
}