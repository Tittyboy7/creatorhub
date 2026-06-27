import { useState } from "react";

export default function AddChartModal({ onClose, onAddChart }) {
  const [metric, setMetric] = useState("revenue");
  const [chartType, setChartType] = useState("bar");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-lg rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6 text-white shadow-2xl shadow-black/40">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Custom Chart
            </p>

            <h2 className="mt-2 text-2xl font-bold">Add chart</h2>

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
              Chart Type
            </label>
            <select
              className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 p-4"
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
            >
              <option value="bar">Bar</option>
              <option value="line">Line</option>
              <option value="area">Area</option>
              <option value="pie">Pie</option>
            </select>
          </div>
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
              })
            }
            className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-zinc-200"
          >
            Add Chart
          </button>
        </div>
      </div>
    </div>
  );
}