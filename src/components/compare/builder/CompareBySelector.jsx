import BuilderSection from "./BuilderSection";

const compareOptions = [
  {
    key: "platform",
    label: "Platform",
    description: "Compare YouTube, Twitch, Shopify, Patreon, and more.",
  },
  {
    key: "business_system",
    label: "Business System",
    description: "Compare content, commerce, memberships, and payments.",
  },
  {
    key: "month",
    label: "Month",
    description: "See how this metric changes over time.",
  },
  {
    key: "product",
    label: "Product",
    description: "Compare individual products or storefront items.",
  },
];

export default function CompareBySelector({ compareBy, setCompareBy }) {
  return (
    <BuilderSection
      title="2. How do you want to compare it?"
      description="Choose how this widget should group your data."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {compareOptions.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setCompareBy(item.key)}
            className={`rounded-2xl border p-3 text-left ${
              compareBy === item.key
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