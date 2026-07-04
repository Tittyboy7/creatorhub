import SavedCompareChart from "./SavedCompareChart";
import WidgetSnapshotPanel from "./focus/WidgetSnapshotPanel";
import WidgetDetailsPanel from "./focus/WidgetDetailsPanel";
import WidgetActionsPanel from "./focus/WidgetActionsPanel";

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
            <WidgetSnapshotPanel
              widget={chart}
              data={data}
              filters={{
                platform: chart?.platform || chart?.config?.platform || "all",
                metric: chart?.metric || chart?.config?.metric || "revenue",
                visualization:
                  chart?.visualization || chart?.config?.visualization || "chart",
              }}
            />

            <WidgetDetailsPanel chart={chart} />

            <WidgetActionsPanel
              chart={chart}
              onEdit={onEdit}
              onDuplicate={onDuplicate}
              onExport={onExport}
            />
          </div>
        </div>
      </div>
    </div>
  );
}