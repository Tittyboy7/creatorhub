import { AI_PRIORITIES } from "../types/priorityTypes";
import {
  INSIGHT_CATEGORIES,
  INSIGHT_SEVERITIES,
} from "../types/insightTypes";

export function buildRevenueInsights({ context, revenueSummary }) {
  const volatilityInsight = revenueSummary.hasHighVolatility
    ? {
        title: "High volatility detected",
        summary:
          "This widget has a wide gap between its lowest and highest revenue points. Look at what happened around the strongest revenue spike. If it came from a product launch, sponsorship, promotion, or content moment, you may be able to repeat that strategy.",
        severity: INSIGHT_SEVERITIES.WARNING,
        category: INSIGHT_CATEGORIES.ANOMALY,
        priority: AI_PRIORITIES.HIGH,
      }
    : {
        title: "Revenue range looks stable",
        summary:
          "Revenue looks relatively steady in this widget. That kind of consistency can make it easier to plan future content, product launches, and platform strategy.",
        severity: INSIGHT_SEVERITIES.SUCCESS,
        category: INSIGHT_CATEGORIES.PERFORMANCE,
        priority: AI_PRIORITIES.MEDIUM,
      };

  return [
    {
      title: "Structured AI context active",
      summary:
        "This widget is ready for intelligent analysis using your structured creator business data.",
      severity: INSIGHT_SEVERITIES.SUCCESS,
      category: INSIGHT_CATEGORIES.SYSTEM,
      priority: AI_PRIORITIES.LOW,
    },
    {
      title: "Widget data readiness",
      summary: revenueSummary.hasData
        ? `This widget has ${revenueSummary.rowCount} data points available, giving the snapshot enough information to look for useful patterns.`
        : "This widget does not have enough data yet for deeper analysis.",
      severity: revenueSummary.hasData
        ? INSIGHT_SEVERITIES.SUCCESS
        : INSIGHT_SEVERITIES.WARNING,
      category: INSIGHT_CATEGORIES.DATA_READINESS,
      priority: revenueSummary.hasData
        ? AI_PRIORITIES.LOW
        : AI_PRIORITIES.HIGH,
    },
    {
      title: "Revenue snapshot",
      summary: revenueSummary.hasRevenueValues
        ? `This widget shows approximately ${formatCurrency(
            revenueSummary.totalRevenue
          )} in tracked revenue, averaging ${formatCurrency(
            revenueSummary.averageRevenue
          )} per data point.`
        : "No usable revenue values were detected in this widget yet.",
      severity: revenueSummary.hasRevenueValues
        ? INSIGHT_SEVERITIES.INFO
        : INSIGHT_SEVERITIES.WARNING,
      category: INSIGHT_CATEGORIES.REVENUE,
      priority: AI_PRIORITIES.MEDIUM,
    },
    volatilityInsight,
  ];
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}