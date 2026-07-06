"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function SummaryList({
  items = [],
  initialVisibleCount = 3,
  renderItem,
  getKey,
  expandLabel = "Show more",
  collapseLabel = "Show less",
  emptyState = null,
}) {
  const [expanded, setExpanded] = useState(false);

  const safeItems = Array.isArray(items) ? items : [];
  const hasItems = safeItems.length > 0;
  const hasHiddenItems = safeItems.length > initialVisibleCount;

  const visibleItems = expanded
    ? safeItems
    : safeItems.slice(0, initialVisibleCount);

  if (!hasItems) {
    return emptyState;
  }

  return (
    <div className="space-y-3">
      {visibleItems.map((item, index) => (
        <div key={getKey ? getKey(item, index) : index}>
          {renderItem(item, index)}
        </div>
      ))}

      {hasHiddenItems ? (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 hover:bg-zinc-900 hover:text-white"
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}

          {expanded
            ? collapseLabel
            : `${expandLabel} (${safeItems.length - initialVisibleCount} more)`}
        </button>
      ) : null}
    </div>
  );
}