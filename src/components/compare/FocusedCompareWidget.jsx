import SavedCompareChart from "./SavedCompareChart";
import AIInsightsPanel from "./focus/AIInsightsPanel";
import WidgetDetailsPanel from "./focus/WidgetDetailsPanel";

export default function FocusedCompareWidget({
  chart,
  data,
  metrics,
  onEdit,
  onDuplicate,
  onExport,
  onClose,
}) {
  if (!chart) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6">
      <div className="relative max-h-[92vh] w-full max-w-7xl overflow-y-auto rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6 shadow-2xl shadow-black/60">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full border border-zinc-700 px-3 py-1 text-sm font-semibold text-zinc-300 hover:bg-zinc-800"
        >
          ✕
        </button>

        <div className="space-y-6">
          <SavedCompareChart
            chart={{
              ...chart,
              width: 3,
              height: 2,
            }}
            data={data}
            metrics={metrics}
          />

          <div className="grid gap-6 lg:grid-cols-3">
            <AIInsightsPanel />

            <WidgetDetailsPanel chart={chart} />

            <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5">
              <h3 className="text-lg font-bold text-white">Widget Actions</h3>

              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  onClick={() => onEdit?.(chart)}
                  className="w-full rounded-2xl border border-zinc-700 px-4 py-3 text-left text-sm font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  ✏️ Edit Widget
                </button>

                <button
                  type="button"
                  onClick={() => onDuplicate?.(chart.id)}
                  className="w-full rounded-2xl border border-zinc-700 px-4 py-3 text-left text-sm font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  📄 Duplicate Widget
                </button>

                <button
                  type="button"
                  onClick={() => onExport?.(chart.id)}
                  className="w-full rounded-2xl border border-zinc-700 px-4 py-3 text-left text-sm font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  📤 Export Widget
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}