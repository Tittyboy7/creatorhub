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

  const [currentStep, setCurrentStep] = useState(1);

  const validChartTypes = getValidChartTypes(compareBy);

  const stepLabels = [
    "Measure",
    "Compare",
    "Visualize",
    "Time",
  ];

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
              Custom Widget
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {editingChart ? "Edit widget" : "Add widget"}
            </h2>

            <div className="mt-5 grid grid-cols-4 gap-2">
              {stepLabels.map((label, index) => {
                const step = index + 1;

                return (
                  <button
                    key={label}
                    type="button"
                    className={`rounded-full px-3 py-2 text-xs font-semibold ${
                      true
                        ? "bg-white text-black"
                        : "border border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                    }`}
                  >
                    {step}. {label}
                  </button>
                );
              })}
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

        <div className="mt-6 grid gap-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-zinc-300">
               1. What do you want to measure?
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
              2. How do you want to compare it?
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
              3. Recommended visualization
            </label>
            <p className="mb-3 text-xs text-zinc-500">
              Options update based on what you are measuring and comparing.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {validChartTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setChartType(type)}
                  className={`rounded-2xl border p-4 text-left ${
                    chartType === type
                      ? "border-white bg-white text-black"
                      : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                  }`}
                >
                  <p className="text-sm font-bold capitalize">{type}</p>
                  <p className="mt-1 text-xs opacity-70">
                    {type === "bar"
                      ? "Compare categories."
                      : type === "pie"
                      ? "Show share of a total."
                      : type === "line"
                      ? "Track changes over time."
                      : "Show trend volume."}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
            <label className="mb-2 block text-sm font-semibold text-zinc-300">
              4. What time range?
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
            {editingChart ? "Save Changes" : "Add Widget"}
          </button>
        </div>
      </div>
    </div>
  );
}