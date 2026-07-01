import SavedCompareChart from "./SavedCompareChart";

export default function FocusedCompareWidget({
  chart,
  data,
  metrics,
  onEdit,
  onDelete,
  onClose,
}) {
  if (!chart) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6 py-8">
      <div className="relative max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6 shadow-2xl shadow-black/60">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full border border-zinc-700 px-3 py-1 text-sm font-semibold text-zinc-300 hover:bg-zinc-800"
        >
          ✕
        </button>

        <SavedCompareChart
          chart={{
            ...chart,
            width: 3,
            height: 2,
          }}
          data={data}
          metrics={metrics}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}