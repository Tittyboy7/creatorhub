"use client";

import {
  HiOutlineChartBarSquare,
  HiOutlineSparkles,
} from "react-icons/hi2";

import { useWorkspaceMode } from "@/context/WorkspaceModeContext";

const workspaceModes = [
  {
    value: "insights",
    label: "Insights",
    description: "What matters",
    icon: HiOutlineSparkles,
  },
  {
    value: "analytics",
    label: "Analytics",
    description: "Explore the data",
    icon: HiOutlineChartBarSquare,
  },
];

function ModeOption({
  modeOption,
  isActive,
  onSelect,
}) {
  const Icon = modeOption.icon;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => onSelect(modeOption.value)}
      className={`group relative z-10 flex min-w-[142px] items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors duration-300 ${
        isActive
          ? "text-white"
          : "text-zinc-500 hover:text-zinc-300"
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${
          isActive
            ? "border-violet-400/40 bg-violet-400/15 text-violet-200 shadow-[0_0_18px_rgba(139,92,246,0.22)]"
            : "border-zinc-800 bg-zinc-900 text-zinc-600 group-hover:border-zinc-700 group-hover:text-zinc-400"
        }`}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>

      <span className="min-w-0">
        <span className="block text-sm font-semibold">
          {modeOption.label}
        </span>

        <span
          className={`mt-0.5 block text-[11px] font-medium transition-colors duration-300 ${
            isActive
              ? "text-violet-200/70"
              : "text-zinc-600 group-hover:text-zinc-500"
          }`}
        >
          {modeOption.description}
        </span>
      </span>
    </button>
  );
}

export default function WorkspaceModeToggle({
  className = "",
}) {
  const {
    mode,
    setMode,
    isInsightsMode,
  } = useWorkspaceMode();

  return (
    <div className={`relative ${className}`}>
      <div className="mb-1.5 flex items-center justify-end gap-2 px-1">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
          Workspace View
        </span>

        <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.8)]" />
      </div>

      <div className="relative overflow-hidden rounded-[1.25rem] border border-zinc-800 bg-black/70 p-1.5 shadow-[0_16px_45px_rgba(0,0,0,0.35)] backdrop-blur">
        <div
          aria-hidden="true"
          className={`absolute bottom-1.5 top-1.5 w-[calc(50%-6px)] rounded-2xl border border-violet-500/35 bg-gradient-to-br from-violet-500/25 via-violet-500/12 to-blue-500/10 shadow-[0_0_28px_rgba(124,58,237,0.16)] transition-transform duration-300 ease-out ${
            isInsightsMode
              ? "translate-x-0"
              : "translate-x-full"
          }`}
        />

        <div
          role="tablist"
          aria-label="Workspace view"
          className="relative grid grid-cols-2"
        >
          {workspaceModes.map((modeOption) => (
            <ModeOption
              key={modeOption.value}
              modeOption={modeOption}
              isActive={mode === modeOption.value}
              onSelect={setMode}
            />
          ))}
        </div>
      </div>
    </div>
  );
}