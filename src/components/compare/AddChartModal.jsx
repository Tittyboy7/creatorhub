import { useEffect, useState } from "react";
import WidgetBuilder from "@/components/compare/builder/WidgetBuilder";

  const visualizationRules = {
    platform: ["bar", "pie"],
    business_system: ["bar", "pie"],
    month: ["bar", "line", "area"],
    product: ["bar"],
  };

  function getValidChartTypes(compareBy) {
    return visualizationRules[compareBy] || ["bar"];
  }

export default function AddChartModal({
  onClose,
  onAddChart,
  editingChart,
  platforms = [],
}) {
  const [metric, setMetric] = useState(editingChart?.metric || "revenue");
  const [chartType, setChartType] = useState(editingChart?.chart_type || "bar");
  const [compareBy, setCompareBy] = useState(
    editingChart?.compare_by || "platform"
  );
  const [timePeriod, setTimePeriod] = useState(
    editingChart?.time_period || "all"
  );
  const [selectedPlatforms, setSelectedPlatforms] = useState(
    editingChart?.config?.platforms || platforms
  );

  const validChartTypes = getValidChartTypes(compareBy);

  useEffect(() => {
    if (!validChartTypes.includes(chartType)) {
      setChartType(validChartTypes[0]);
    }
  }, [compareBy, chartType, validChartTypes]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6 text-white shadow-2xl shadow-black/40">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Custom Widget
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {editingChart ? "Edit widget" : "Add widget"}
            </h2>

            <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-zinc-500">
              <span>Measure</span>
              <span>→</span>
              <span>Compare</span>
              <span>→</span>
              <span>Visualize</span>
              <span>→</span>
              <span>Time</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-zinc-700 px-3 py-1 text-sm text-zinc-300 hover:bg-zinc-800"
          >
            ✕
          </button>
        </div>

        <WidgetBuilder
          metric={metric}
          setMetric={setMetric}
          compareBy={compareBy}
          setCompareBy={setCompareBy}
          chartType={chartType}
          setChartType={setChartType}
          validChartTypes={validChartTypes}
          timePeriod={timePeriod}
          setTimePeriod={setTimePeriod}
          platforms={platforms}
          selectedPlatforms={selectedPlatforms}
          setSelectedPlatforms={setSelectedPlatforms}
        />

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-300 hover:bg-zinc-800"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() =>
              onAddChart({
                metric,
                chartType,
                compareBy,
                timePeriod,
                selectedPlatforms,
              })
            }
            className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-zinc-200"
          >
            {editingChart ? "Save Changes" : "Add Widget"}
          </button>
        </div>
      </div>
    </div>
  );
}