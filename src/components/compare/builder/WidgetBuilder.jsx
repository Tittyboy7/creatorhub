import MetricSelector from "./MetricSelector";
import CompareBySelector from "./CompareBySelector";
import VisualizationSelector from "./VisualizationSelector";
import TimeRangeSelector from "./TimeRangeSelector";
import WidgetPreviewPanel from "./WidgetPreviewPanel";

export default function WidgetBuilder({
  metric,
  setMetric,
  compareBy,
  setCompareBy,
  chartType,
  setChartType,
  validChartTypes,
  timePeriod,
  setTimePeriod,
}) {
  return (
    <div className="mt-6 grid max-h-[62vh] gap-4 overflow-y-auto pr-1">
      <MetricSelector
        metric={metric}
        setMetric={setMetric}
      />

      <CompareBySelector
        compareBy={compareBy}
        setCompareBy={setCompareBy}
      />

      <VisualizationSelector
        chartType={chartType}
        setChartType={setChartType}
        validChartTypes={validChartTypes}
      />

      <TimeRangeSelector
        timePeriod={timePeriod}
        setTimePeriod={setTimePeriod}
      />

      <WidgetPreviewPanel
        metric={metric}
        compareBy={compareBy}
        chartType={chartType}
        timePeriod={timePeriod}
      />
    </div>
  );
}