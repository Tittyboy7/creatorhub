"use client";

import { useState } from "react";

import { useWorkspaceMode } from "@/context/WorkspaceModeContext";

import PlatformChapterHeader from "./design-system/chapter/PlatformChapterHeader";

function getChapterClasses({
  isAnalyticsMode,
  insightsAccent,
  analyticsAccent,
}) {
  const activeAccent = isAnalyticsMode
    ? analyticsAccent
    : insightsAccent;

  if (activeAccent === "green") {
    return {
      border: "border-green-500/30",
      shadow: isAnalyticsMode
        ? "shadow-[0_18px_55px_rgba(0,0,0,0.22)]"
        : "",
    };
  }

  if (activeAccent === "blue") {
    return {
      border: "border-blue-500/30",
      shadow:
        "shadow-[0_18px_55px_rgba(0,0,0,0.22)]",
    };
  }

  if (activeAccent === "amber") {
    return {
      border: "border-amber-500/30",
      shadow: isAnalyticsMode
        ? "shadow-[0_18px_55px_rgba(0,0,0,0.22)]"
        : "",
    };
  }

  if (activeAccent === "cyan") {
    return {
      border: "border-cyan-500/30",
      shadow: isAnalyticsMode
        ? "shadow-[0_18px_55px_rgba(0,0,0,0.22)]"
        : "",
    };
  }

  if (activeAccent === "pink") {
    return {
      border: "border-pink-500/30",
      shadow: isAnalyticsMode
        ? "shadow-[0_18px_55px_rgba(0,0,0,0.22)]"
        : "",
    };
  }

  return {
    border: "border-violet-500/30",
    shadow: isAnalyticsMode
      ? "shadow-[0_18px_55px_rgba(0,0,0,0.22)]"
      : "",
  };
}

export default function PlatformChapterLayout({
  id,
  number,
  title,
  insightsDescription,
  analyticsDescription,
  insightsAccent = "violet",
  analyticsAccent = "blue",
  defaultExpanded = true,
  insightsContent,
  analyticsContent,
  className = "",
}) {
  const [isExpanded, setIsExpanded] =
    useState(defaultExpanded);

  const {
    isInsightsMode,
    isAnalyticsMode,
  } = useWorkspaceMode();

  const styles = getChapterClasses({
    isAnalyticsMode,
    insightsAccent,
    analyticsAccent,
  });

  const contentId = `${id}-content`;

  const activeDescription = isAnalyticsMode
    ? analyticsDescription
    : insightsDescription;

  const activeAccent = isAnalyticsMode
    ? analyticsAccent
    : insightsAccent;

  const activeContent = isAnalyticsMode
    ? analyticsContent
    : insightsContent;

  return (
    <article
      id={id}
      data-workspace-mode={
        isAnalyticsMode ? "analytics" : "insights"
      }
      className={`scroll-mt-6 overflow-hidden rounded-3xl border bg-zinc-900 transition-all duration-300 ${styles.border} ${styles.shadow} ${className}`}
    >
      <PlatformChapterHeader
        number={number}
        title={title}
        description={activeDescription}
        accent={activeAccent}
        isExpanded={isExpanded}
        onToggle={() =>
          setIsExpanded((current) => !current)
        }
        controls={contentId}
      />

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          isExpanded
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            id={contentId}
            className="border-t border-zinc-800 p-5 md:p-6"
          >
            <div
              key={
                isAnalyticsMode
                  ? `${id}-analytics`
                  : `${id}-insights`
              }
              className="animate-[workspaceModeFade_300ms_ease-out]"
            >
              {activeContent}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}