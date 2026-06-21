"use client";

import { useState } from "react";

export function useRevenueUI() {
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [selectedRevenueType, setSelectedRevenueType] = useState("All");
  const [chartType, setChartType] = useState("area");
  const [showIntelligence, setShowIntelligence] = useState(false);

  const [visibleWidgets, setVisibleWidgets] = useState({
    platformHealth: true,
    revenueForecast: true,
    upcomingPayouts: true,
    revenueEvents: true,
    revenueTimeline: true,
  });

  return {
    selectedPlatform,
    setSelectedPlatform,
    selectedRevenueType,
    setSelectedRevenueType,
    chartType,
    setChartType,
    showIntelligence,
    setShowIntelligence,
    visibleWidgets,
    setVisibleWidgets,
  };
}