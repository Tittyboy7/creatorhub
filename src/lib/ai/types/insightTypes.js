export const INSIGHT_SEVERITIES = {
  SUCCESS: "success",
  INFO: "info",
  WARNING: "warning",
  ERROR: "error",
};

export const INSIGHT_CATEGORIES = {
  SYSTEM: "system",
  DATA_READINESS: "data-readiness",
  REVENUE: "revenue",
  PERFORMANCE: "performance",
  ANOMALY: "anomaly",
  RECOMMENDATION: "recommendation",
  FORECAST: "forecast",
};

export const INSIGHT_CATEGORY_FILTERS = [
  "all",
  INSIGHT_CATEGORIES.SYSTEM,
  INSIGHT_CATEGORIES.DATA_READINESS,
  INSIGHT_CATEGORIES.REVENUE,
  INSIGHT_CATEGORIES.PERFORMANCE,
  INSIGHT_CATEGORIES.ANOMALY,
];