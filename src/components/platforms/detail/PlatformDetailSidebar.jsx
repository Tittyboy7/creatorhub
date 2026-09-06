"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getPlatform } from "@/lib/platforms";

const WORKSPACE_LINKS = [
  {
    label: "Overview",
    href: "#platform-overview",
    sectionId: "platform-overview",
    icon: "⌂",
  },
  {
    label: "Content",
    href: "#content-performance",
    sectionId: "content-performance",
    icon: "▣",
  },
  {
    label: "Audience",
    href: "#platform-section-audience",
    sectionId: "platform-section-audience",
    icon: "◎",
  },
  {
    label: "Revenue",
    href: "#platform-section-revenue",
    sectionId: "platform-section-revenue",
    icon: "$",
  },
  {
    label: "Traffic",
    href: "#platform-section-traffic",
    sectionId: "platform-section-traffic",
    icon: "↗",
  },
  {
    label: "Retention",
    href: "#platform-section-retention",
    sectionId: "platform-section-retention",
    icon: "◔",
  },
];

function SidebarSection({ title, children }) {
  return (
    <section className="border-t border-zinc-800/80 px-5 py-5 first:border-t-0">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
        {title}
      </p>

      <div className="mt-4">{children}</div>
    </section>
  );
}

function WorkspaceNavigation() {
  const [activeSection, setActiveSection] =
    useState("platform-overview");

  useEffect(() => {
    const sections = WORKSPACE_LINKS.map(
      (item) =>
        document.getElementById(
          item.sectionId
        )
    ).filter(Boolean);

    if (!sections.length) {
      return;
    }

    function updateActiveSection() {
      const referencePoint = 180;

      let currentSection =
        sections[0]?.id ||
        "platform-overview";

      sections.forEach((section) => {
        const rect =
          section.getBoundingClientRect();

        if (
          rect.top <= referencePoint
        ) {
          currentSection = section.id;
        }
      });

      setActiveSection(currentSection);
    }

    updateActiveSection();

    window.addEventListener(
      "scroll",
      updateActiveSection,
      {
        passive: true,
      }
    );

    window.addEventListener(
      "resize",
      updateActiveSection
    );

    return () => {
      window.removeEventListener(
        "scroll",
        updateActiveSection
      );

      window.removeEventListener(
        "resize",
        updateActiveSection
      );
    };
  }, []);

  return (
    <section className="sticky top-24 z-20 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/90 p-3 shadow-[0_18px_45px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
        Workspace
      </p>

      <nav className="space-y-1">
        {WORKSPACE_LINKS.map((item) => {
          const isActive =
            activeSection ===
            item.sectionId;

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() =>
                setActiveSection(
                  item.sectionId
                )
              }
              aria-current={
                isActive
                  ? "location"
                  : undefined
              }
              className={`
                group
                flex
                items-center
                gap-3
                rounded-2xl
                border
                px-3
                py-2.5
                text-sm
                font-medium
                transition
                ${
                  isActive
                    ? "border-violet-500/25 bg-violet-500/10 text-violet-200"
                    : "border-transparent text-zinc-400 hover:bg-zinc-800/70 hover:text-white"
                }
              `}
            >
              <span
                className={`
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  border
                  text-sm
                  transition
                  ${
                    isActive
                      ? "border-violet-500/30 bg-violet-500/15 text-violet-200"
                      : "border-zinc-800 bg-zinc-950 text-zinc-500 group-hover:border-zinc-700 group-hover:text-zinc-300"
                  }
                `}
              >
                {item.icon}
              </span>

              <span>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </section>
  );
}

function PlatformHealthCard({
  platform,
  confidence,
}) {
  return (
    <section className="rounded-3xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 to-zinc-900/70 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            {platform.name} Health
          </p>

          <p className="mt-2 text-lg font-bold text-emerald-300">
            Healthy
          </p>
        </div>

        <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-300">
          ♡
        </span>
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-zinc-500">
            Connection
          </span>

          <span className="font-semibold text-emerald-300">
            Good
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-zinc-500">
            Data confidence
          </span>

          <span className="font-semibold text-white">
            {confidence.score}%
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-zinc-500">
            Last synced
          </span>

          <span className="font-semibold text-white">
            {platform.lastSynced}
          </span>
        </div>
      </div>
    </section>
  );
}

export default function PlatformDetailSidebar({
  platform,
  platformToday,
}) {
  const platformConfig = getPlatform(platform.key);

  const confidence = platformToday.confidence;

  const externalDashboard =
    platform.externalDashboard ||
    platformConfig?.externalDashboard;

  return (
    <aside className="h-full space-y-5">
      <WorkspaceNavigation />

      <PlatformHealthCard
        platform={platform}
        confidence={confidence}
      />

      <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/70">
        <SidebarSection title="Quick Actions">
          <div className="space-y-1">
            {externalDashboard?.href ? (
              <a
                href={externalDashboard.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
              >
                <span>
                  Open {platform.name} Dashboard
                </span>

                <span aria-hidden="true">↗</span>
              </a>
            ) : null}

            <button
              type="button"
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
            >
              <span>Review Content Ideas</span>
              <span aria-hidden="true">→</span>
            </button>

            <button
              type="button"
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
            >
              <span>Analyze Content</span>
              <span aria-hidden="true">→</span>
            </button>

            <Link
              href={`/connected-accounts/${platform.key}`}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
            >
              <span>Connection Settings</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </SidebarSection>
      </div>

      <div className="rounded-3xl border border-violet-500/20 bg-gradient-to-b from-violet-500/10 to-zinc-900 p-5">
        <div className="flex items-center gap-2">
          <span className="text-xl text-violet-300">
            ✦
          </span>

          <h2 className="font-bold text-white">
            Need help growing?
          </h2>
        </div>

        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Get personalized guidance from your
          CreatorsHub business advisor.
        </p>

        <button
          type="button"
          className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-violet-500/40 bg-violet-500/10 px-4 py-3 text-sm font-semibold text-violet-200 transition hover:bg-violet-500/20"
        >
          Ask CreatorsHub
          <span
            aria-hidden="true"
            className="ml-2"
          >
            ✦
          </span>
        </button>
      </div>
    </aside>
  );
}