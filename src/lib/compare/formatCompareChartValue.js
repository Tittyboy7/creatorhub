export function formatCompareChartValue(value, metric = "") {
  const number = Number(value || 0);
  const isCurrency = metric === "revenue" || metric.includes("revenue");

  if (isCurrency) {
    if (Math.abs(number) >= 1000000) {
      return `$${(number / 1000000).toFixed(1)}M`;
    }

    if (Math.abs(number) >= 1000) {
      return `$${Math.round(number / 1000)}k`;
    }

    return `$${number.toLocaleString()}`;
  }

  if (Math.abs(number) >= 1000000) {
    return `${(number / 1000000).toFixed(1)}M`;
  }

  if (Math.abs(number) >= 1000) {
    return `${Math.round(number / 1000)}k`;
  }

  return number.toLocaleString();
}

export function formatExactCompareChartValue(value, metric = "") {
  const number = Number(value || 0);
  const isCurrency = metric === "revenue" || metric.includes("revenue");

  if (isCurrency) {
    return number.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  }

  return number.toLocaleString();
}