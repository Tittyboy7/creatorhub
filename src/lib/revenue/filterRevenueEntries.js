export function filterRevenueEntries({
  entries,
  selectedPlatform,
  selectedRevenueType,
}) {
  return entries
    .filter((entry) => {
      const platformMatches =
        selectedPlatform === "All" || entry.platform === selectedPlatform;

      const typeMatches =
        selectedRevenueType === "All" ||
        entry.revenue_type === selectedRevenueType;

      return platformMatches && typeMatches;
    })
    .sort((a, b) => b.entry_month.localeCompare(a.entry_month));
}