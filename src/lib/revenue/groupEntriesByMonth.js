export function groupEntriesByMonth(filteredEntries) {
  return filteredEntries.reduce((groups, entry) => {
    const month = entry.entry_month || "Unknown";

    if (!groups[month]) {
      groups[month] = [];
    }

    groups[month].push(entry);

    return groups;
  }, {});
}