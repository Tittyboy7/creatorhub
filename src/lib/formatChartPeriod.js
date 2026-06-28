export function formatChartPeriod(period, short = true) {
  if (!period) return "";

  const [year, month] = period.split("-");

  const date = new Date(Number(year), Number(month) - 1);

  return date.toLocaleDateString("en-US", {
    month: short ? "short" : "long",
    year: short ? "2-digit" : "numeric",
  });
}