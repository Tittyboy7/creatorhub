export function calculateRevenueTotals({
  filteredEntries,
  currentMonth,
}) {
  const totalRevenue = filteredEntries.reduce(
    (sum, entry) => sum + Number(entry.amount || 0),
    0
  );

  const thisMonthRevenue = filteredEntries
    .filter((entry) => entry.entry_month === currentMonth)
    .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);

  return {
    totalRevenue,
    thisMonthRevenue,
  };
}