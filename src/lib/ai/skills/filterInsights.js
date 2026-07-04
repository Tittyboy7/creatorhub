export function filterInsights(insights = [], filters = {}) {
  const rows = Array.isArray(insights) ? insights : [];

  return rows.filter((insight) => {
    const categoryMatches =
      !filters.category ||
      filters.category === "all" ||
      insight.category === filters.category;

    const severityMatches =
      !filters.severity ||
      filters.severity === "all" ||
      insight.severity === filters.severity;

    return categoryMatches && severityMatches;
  });
}