export function summarizeRevenueData(data = []) {
  const rows = Array.isArray(data) ? data : [];

  const revenueValues = rows
    .map((item) => Number(item.revenue ?? item.value ?? item.amount ?? 0))
    .filter((value) => Number.isFinite(value));

  const totalRevenue = revenueValues.reduce((sum, value) => sum + value, 0);

  const averageRevenue =
    revenueValues.length > 0 ? totalRevenue / revenueValues.length : 0;

  const highestRevenue =
    revenueValues.length > 0 ? Math.max(...revenueValues) : 0;

  const lowestRevenue =
    revenueValues.length > 0 ? Math.min(...revenueValues) : 0;

  const revenueRange = highestRevenue - lowestRevenue;

  const volatilityRatio =
    averageRevenue > 0 ? revenueRange / averageRevenue : 0;

  return {
    rowCount: rows.length,
    valueCount: revenueValues.length,
    hasData: rows.length > 0,
    hasRevenueValues: revenueValues.length > 0,
    totalRevenue,
    averageRevenue,
    highestRevenue,
    lowestRevenue,
    revenueRange,
    volatilityRatio,
    hasHighVolatility: volatilityRatio >= 1,
  };
}