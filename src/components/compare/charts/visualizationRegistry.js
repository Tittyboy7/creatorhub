import CompareAreaChart from "./CompareAreaChart";
import CompareBarChart from "./CompareBarChart";
import CompareLineChart from "./CompareLineChart";
import ComparePieChart from "./ComparePieChart";

export const visualizationRegistry = {
  area: CompareAreaChart,
  bar: CompareBarChart,
  line: CompareLineChart,
  pie: ComparePieChart,
};

export function getVisualizationComponent(chartType) {
  return visualizationRegistry[chartType] || CompareBarChart;
}