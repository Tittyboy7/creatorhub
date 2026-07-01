export function buildCompareXAxisSettings({ chart, data = [] } = {}) {
  const isMonthChart = chart?.compare_by === "month";
  const width = Number(chart?.width || 1);

  const interval = isMonthChart
    ? width >= 3
      ? 1
      : width === 2
      ? 2
      : 3
    : width >= 3
    ? 0
    : "preserveStartEnd";

  function formatTick(value, index) {
    if (isMonthChart && width === 1) {
      return index % 4 === 0 ? value : "";
    }

    if (!isMonthChart && width === 1) {
      if (index === 0 || index === data.length - 1) return value;
      return "";
    }

    if (!isMonthChart && width === 2) {
      return index % 2 === 0 ? value : "";
    }

    return value;
  }

  return {
    interval,
    formatTick,
  };
}