"use client";

import { WorkspaceModeProvider } from "@/context/WorkspaceModeContext";
import WorkspaceModeFloatingToggle from "./WorkspaceModeFloatingToggle";

function WorkspaceLayoutContent({
  eyebrow,
  title,
  description,
  sidebar,
  children,
  workspaceHeader = null,
  showHeader = true,
  showFloatingModeToggle = true,
}) {
  const hasGenericHeader =
    showHeader && (eyebrow || title || description);

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-6 text-white sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1480px] space-y-6">
        {workspaceHeader}

        {hasGenericHeader && (
          <section className="rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6 md:p-8">
            {eyebrow && (
              <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                {eyebrow}
              </p>
            )}

            {title && (
              <h1 className="mt-2 text-4xl font-bold text-white">
                {title}
              </h1>
            )}

            {description && (
              <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">
                {description}
              </p>
            )}
          </section>
        )}

        <div
          className={`grid gap-6 ${
            sidebar
              ? "xl:grid-cols-[300px_minmax(0,1fr)]"
              : "grid-cols-1"
          }`}
        >
          {sidebar && (
            <aside className="min-w-0 self-stretch">
              {sidebar}
            </aside>
          )}

          <main className="min-w-0 space-y-6">
            {showFloatingModeToggle && (
              <WorkspaceModeFloatingToggle />
            )}

            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function WorkspaceLayout(props) {
  return (
    <WorkspaceModeProvider>
      <WorkspaceLayoutContent {...props} />
    </WorkspaceModeProvider>
  );
}