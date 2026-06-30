import ComparePieChart from "@/components/compare/charts/ComparePieChart";
import CompareAreaChart from "@/components/compare/charts/CompareAreaChart";
import CompareLineChart from "@/components/compare/charts/CompareLineChart";
import CompareBarChart from "@/components/compare/charts/CompareBarChart";
import CompareChartTooltip from "@/components/compare/charts/CompareChartTooltip";
import { buildCompareXAxisSettings } from "@/lib/compare/buildCompareXAxisSettings";

import {
  formatCompareChartValue,
  formatExactCompareChartValue,
} from "@/lib/compare/formatCompareChartValue";

export default function SavedCompareChart({
  chart,
  data = [],
  onDelete,
  onResize,
  onEdit,
}) {

  const hasData = data.length > 0;
  
  const { interval: xAxisInterval, formatTick: formatXAxisTick } =
  buildCompareXAxisSettings({
    chart,
    data,
  });

  function formatChartValue(value) {
    return formatCompareChartValue(value, chart.metric);
  }

  function formatExactChartValue(value) {
    return formatExactCompareChartValue(value, chart.metric);
  }

  function CustomTooltip(props) {
    return (
      <CompareChartTooltip
        {...props}
        chart={chart}
        formatExactChartValue={formatExactChartValue}
      />
    );
  }

  return (
    <div
      className={`rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-5 shadow-2xl shadow-black/20 ${
        chart.size === "large"
          ? "md:col-span-2 xl:col-span-3"
          : chart.size === "medium"
          ? "xl:col-span-2"
          : ""
      }`}
    >
      <div className="mb-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => onEdit?.(chart)}
          className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={() => onDelete?.(chart.id)}
          className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-400 hover:border-red-500/60 hover:bg-red-500/10 hover:text-red-300"
        >
          Remove
        </button>
      </div>

      {!hasData ? (
        <div className="rounded-2xl border border-dashed border-zinc-700 p-8 text-center">
          <p className="text-sm text-zinc-400">
            No data available for this saved chart yet.
          </p>
        </div>
      ) : (
        <div className="h-72 rounded-3xl border border-zinc-800 bg-zinc-950/70 p-4">
          {chart.chart_type === "line" ? (
            <CompareLineChart
              chart={chart}
              data={data}
              CustomTooltip={CustomTooltip}
              formatChartValue={formatChartValue}
              formatXAxisTick={formatXAxisTick}
              xAxisInterval={xAxisInterval}
            />
          ) : chart.chart_type === "pie" ? (
            <ComparePieChart
              chart={chart}
              data={data}
              formatExactChartValue={formatExactChartValue}
              CustomTooltip={CustomTooltip}
            />
          ) : chart.chart_type === "area" ? (
            <CompareAreaChart
              chart={chart}
              data={data}
              CustomTooltip={CustomTooltip}
              formatChartValue={formatChartValue}
              formatXAxisTick={formatXAxisTick}
              xAxisInterval={xAxisInterval}
            />
          ) : (
            <CompareBarChart
              chart={chart}
              data={data}
              CustomTooltip={CustomTooltip}
              formatChartValue={formatChartValue}
              formatXAxisTick={formatXAxisTick}
              xAxisInterval={xAxisInterval}
            />
          )}
        </div>
      )}
    </div>
  );
}