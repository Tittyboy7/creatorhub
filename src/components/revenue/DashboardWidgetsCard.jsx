export default function DashboardWidgetsCard({
  widgets,
  visibleWidgets,
  setVisibleWidgets,
}) {
  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          View Controls
        </p>

        <h2 className="mt-1 text-2xl font-bold">Dashboard Widgets</h2>

        <p className="mt-2 text-sm text-zinc-500">
          Future controls for showing, hiding, and organizing dashboard sections.
        </p>
      </div>

      <div className="space-y-3">
        {widgets.map((widget) => (
          <div
            key={widget.key}
            className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-3"
          >
            <p className="text-sm font-semibold">{widget.label}</p>

            <button
              type="button"
              onClick={() =>
                setVisibleWidgets((current) => ({
                  ...current,
                  [widget.key]: !current[widget.key],
                }))
              }
              className="rounded-xl border border-zinc-700 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
            >
              {visibleWidgets[widget.key] ? "Visible" : "Hidden"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}