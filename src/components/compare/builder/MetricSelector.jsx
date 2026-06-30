import BuilderSection from "./BuilderSection";

const metrics = [
  { key: "revenue", label: "Revenue", description: "Track income across platforms." },
  { key: "views", label: "Views", description: "Compare audience reach." },
  { key: "subscribers", label: "Subscribers", description: "Track audience growth." },
  { key: "orders", label: "Orders", description: "Measure commerce activity." },
  { key: "customers", label: "Customers", description: "Track buyer activity." },
];

export default function MetricSelector({ metric, setMetric }) {
  return (
    <BuilderSection
      title="1. What do you want to measure?"
      description="Choose the business metric this widget should focus on."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {metrics.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setMetric(item.key)}
            className={`rounded-2xl border p-3 text-left ${
              metric === item.key
                ? "border-white bg-white text-black"
                : "border-zinc-700 bg-zinc-950 text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            <p className="text-sm font-bold">{item.label}</p>
            <p className="mt-1 text-xs opacity-70">{item.description}</p>
          </button>
        ))}
      </div>
    </BuilderSection>
  );
}