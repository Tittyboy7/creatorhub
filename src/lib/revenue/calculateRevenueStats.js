export function calculateRevenueStats(filteredEntries) {
  const platformTotals = filteredEntries.reduce((totals, entry) => {
    const platform = entry.platform || "Other";
    totals[platform] = (totals[platform] || 0) + Number(entry.amount || 0);
    return totals;
  }, {});

  const revenueTypeTotals = filteredEntries.reduce((totals, entry) => {
    const type = entry.revenue_type || "Other";
    totals[type] = (totals[type] || 0) + Number(entry.amount || 0);
    return totals;
  }, {});

  const monthlyTotals = filteredEntries.reduce((totals, entry) => {
    totals[entry.entry_month] =
      (totals[entry.entry_month] || 0) + Number(entry.amount || 0);
    return totals;
  }, {});

  const monthlyChartData = Object.entries(monthlyTotals)
    .map(([month, amount]) => ({
      month,
      revenue: Number(amount.toFixed(2)),
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const platformChartData = Object.entries(platformTotals)
    .map(([platform, amount]) => ({
      platform,
      revenue: Number(amount.toFixed(2)),
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const revenueTypeChartData = Object.entries(revenueTypeTotals)
    .map(([type, amount]) => ({
      type,
      revenue: Number(amount.toFixed(2)),
    }))
    .sort((a, b) => b.revenue - a.revenue);

  return {
    monthlyChartData,
    platformChartData,
    revenueTypeChartData,
  };
}