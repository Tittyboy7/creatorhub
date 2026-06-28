import { useEffect, useState } from "react";

  const visualizationRules = {
    platform: ["bar", "pie"],
    business_system: ["bar", "pie"],
    month: ["bar", "line", "area"],
    product: ["bar"],
  };

  function getValidChartTypes(compareBy) {
    return visualizationRules[compareBy] || ["bar"];
  }

export default function AddChartModal({ onClose, onAddChart, editingChart }) {
  const [metric, setMetric] = useState(editingChart?.metric || "revenue");
  const [chartType, setChartType] = useState(editingChart?.chart_type || "bar");
  const [compareBy, setCompareBy] = useState(
    editingChart?.compare_by || "platform"
  );
  const [timePeriod, setTimePeriod] = useState(
    editingChart?.time_period || "all"
  );

  const validChartTypes = getValidChartTypes(compareBy);

  useEffect(() => {
    if (!validChartTypes.includes(chartType)) {
      setChartType(validChartTypes[0]);
    }
  }, [compareBy, chartType, validChartTypes]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-lg rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6 text-white shadow-2xl shadow-black/40">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Custom Chart
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {editingChart ? "Edit chart" : "Add chart"}
            </h2>

            <p className="mt-2 text-sm text-zinc-400">
              Choose what you want to compare in your workspace.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-zinc-700 px-3 py-1 text-sm text-zinc-300 hover:bg-zinc-800"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-zinc-300">
              Metric
            </label>
            <select
              className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 p-4"
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
            >
              <option value="revenue">Revenue</option>
              <option value="views">Views</option>
              <option value="subscribers">Subscribers</option>
              <option value="orders">Orders</option>
              <option value="customers">Customers</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-zinc-300">
              Compare By
            </label>

            <select
              className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 p-4"
              value={compareBy}
              onChange={(e) => setCompareBy(e.target.value)}
            >
              <option value="platform">Platform</option>
              <option value="business_system">Business System</option>
              <option value="month">Month</option>
              <option value="product">Product</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-zinc-300">
              Chart Type
            </label>
            <select
              className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 p-4"
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
            >
              {validChartTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
            <label className="mb-2 block text-sm font-semibold text-zinc-300">
              Time Period
            </label>

            <select
              className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 p-4"
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="12m">Last 12 Months</option>
              <option value="all">All Time</option>
            </select>
          </div>

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
              })
            }
            className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-zinc-200"
          >
            {editingChart ? "Save Changes" : "Add Chart"}
          </button>
        </div>
      </div>
    </div>
  );
}