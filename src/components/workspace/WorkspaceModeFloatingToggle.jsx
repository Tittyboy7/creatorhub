"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  HiOutlineChartBarSquare,
  HiOutlineSparkles,
} from "react-icons/hi2";

import { useWorkspaceMode } from "@/context/WorkspaceModeContext";

const SHOW_AFTER_SCROLL = 420;

export default function WorkspaceModeFloatingToggle() {
  const { mode, setMode } =
    useWorkspaceMode();

  const [isVisible, setIsVisible] =
    useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsVisible(
        window.scrollY > SHOW_AFTER_SCROLL
      );
    }

    handleScroll();

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  return (
    <div
      className={`
        pointer-events-none
        fixed
        right-4
        top-24
        z-50
        transition-all
        duration-300
        sm:right-6
        lg:right-8
        ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "-translate-y-3 opacity-0"
        }
      `}
      aria-hidden={!isVisible}
    >
      <div className="pointer-events-auto inline-flex items-center rounded-2xl border border-zinc-800 bg-zinc-950/90 p-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <button
          type="button"
          aria-label="Switch to Insights"
          aria-pressed={
            mode === "insights"
          }
          tabIndex={isVisible ? 0 : -1}
          onClick={() =>
            setMode("insights")
          }
          className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300 ${
            mode === "insights"
              ? "border-violet-400/40 bg-violet-500/20 text-violet-200 shadow-[0_0_18px_rgba(139,92,246,0.22)]"
              : "border-transparent text-zinc-600 hover:bg-zinc-900 hover:text-zinc-300"
          }`}
        >
          <HiOutlineSparkles
            className="h-5 w-5"
            aria-hidden="true"
          />
        </button>

        <button
          type="button"
          aria-label="Switch to Analytics"
          aria-pressed={
            mode === "analytics"
          }
          tabIndex={isVisible ? 0 : -1}
          onClick={() =>
            setMode("analytics")
          }
          className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300 ${
            mode === "analytics"
              ? "border-violet-400/40 bg-violet-500/20 text-violet-200 shadow-[0_0_18px_rgba(139,92,246,0.22)]"
              : "border-transparent text-zinc-600 hover:bg-zinc-900 hover:text-zinc-300"
          }`}
        >
          <HiOutlineChartBarSquare
            className="h-5 w-5"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );
}