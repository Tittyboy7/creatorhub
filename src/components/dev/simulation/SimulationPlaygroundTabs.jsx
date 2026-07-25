const PLAYGROUND_TABS = [
  {
    id: "overview",
    label: "Overview",
    description: "Periods, signals, and business brief",
  },
  {
    id: "business",
    label: "Business",
    description: "Intelligence, risks, and events",
  },
  {
    id: "prompts",
    label: "Prompts",
    description: "System and user prompt previews",
  },
  {
    id: "context",
    label: "Context",
    description: "AI-ready business context",
  },
  {
    id: "raw",
    label: "Raw JSON",
    description: "Complete skill response",
  },
];

export default function SimulationPlaygroundTabs({
  activeTab,
  onTabChange,
  hasAIResult = false,
}) {
  return (
    <nav
      aria-label="Simulation Playground sections"
      className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900"
    >
      <div className="overflow-x-auto">
        <div className="flex min-w-max gap-1 p-2">
          {PLAYGROUND_TABS.map((tab) => {
            const isActive =
              activeTab === tab.id;

            const requiresAIResult =
              tab.id === "context" ||
              tab.id === "raw";

            const isUnavailable =
              requiresAIResult &&
              !hasAIResult;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  onTabChange(tab.id)
                }
                disabled={isUnavailable}
                aria-current={
                  isActive ? "page" : undefined
                }
                className={`group min-w-[170px] rounded-2xl border px-4 py-3 text-left transition ${
                  isActive
                    ? "border-violet-500/40 bg-violet-500/10"
                    : "border-transparent hover:border-zinc-700 hover:bg-zinc-800/70"
                } ${
                  isUnavailable
                    ? "cursor-not-allowed opacity-40"
                    : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isActive
                        ? "bg-violet-400"
                        : "bg-zinc-700 group-hover:bg-zinc-500"
                    }`}
                  />

                  <span
                    className={`text-sm font-semibold ${
                      isActive
                        ? "text-white"
                        : "text-zinc-300"
                    }`}
                  >
                    {tab.label}
                  </span>
                </div>

                <p className="mt-1.5 text-xs leading-5 text-zinc-500">
                  {isUnavailable
                    ? "Run the AI test first"
                    : tab.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}