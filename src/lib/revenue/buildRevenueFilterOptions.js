export function buildRevenueFilterOptions(entries) {
  const platforms = [
    "All",
    ...new Set(entries.map((entry) => entry.platform).filter(Boolean)),
  ];

  const revenueTypes = [
    "All",
    ...new Set(entries.map((entry) => entry.revenue_type).filter(Boolean)),
  ];

  return {
    platforms,
    revenueTypes,
  };
}