import { BUSINESS_CONTEXT_VERSION } from "../types/businessContext";

export function buildBusinessContext({
  creator = null,
  widget = null,
  data = [],
  filters = {},
  timeframe = null,
  source = "compare-workspace",
} = {}) {
  return {
    version: BUSINESS_CONTEXT_VERSION,
    source,
    generatedAt: new Date().toISOString(),

    creator: creator
      ? {
          id: creator.id ?? null,
          username: creator.username ?? null,
          displayName: creator.display_name ?? creator.displayName ?? null,
          niche: creator.niche ?? null,
        }
      : null,

    widget: widget
      ? {
          id: widget.id ?? null,
          title: widget.title ?? null,
          type: widget.type ?? null,
          visualization: widget.visualization ?? null,
          platform: widget.platform ?? null,
          metric: widget.metric ?? null,
        }
      : null,

    filters,
    timeframe,

    dataSummary: {
      rowCount: Array.isArray(data) ? data.length : 0,
      hasData: Array.isArray(data) && data.length > 0,
    },

    data,
  };
}