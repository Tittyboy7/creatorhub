export default function WidgetActionsPanel({
  chart,
  onEdit,
  onDuplicate,
  onExport,
}) {
  return (
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
  );
}