export function buildCompareXAxisSettings({ chart, data = [] } = {}) {
  const isMonthChart = chart?.compare_by === "month";
  const isSmallChart = chart?.size === "small";
  const isMediumChart = chart?.size === "medium";

  const interval = isMonthChart
    ? isSmallChart
      ? 0
      : isMediumChart
      ? 3
      : 1
    : isSmallChart
    ? "preserveStartEnd"
    : isMediumChart
    ? "preserveStartEnd"
    : 0;

  function formatTick(value, index) {
    if (isMonthChart && isSmallChart) {
      if (index === 0 || index === data.length - 1) return value;
      return "";
    }

    return value;
  }

  return {
    interval,
    formatTick,
  };
}