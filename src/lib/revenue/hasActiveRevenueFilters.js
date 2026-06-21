export function hasActiveRevenueFilters({
  selectedPlatform,
  selectedRevenueType,
}) {
  return selectedPlatform !== "All" || selectedRevenueType !== "All";
}