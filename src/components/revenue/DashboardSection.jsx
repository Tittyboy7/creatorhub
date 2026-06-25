"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";

export default function DashboardSection({
  title,
  description,
  tooltip,
  icon,
  defaultOpen = true,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 transition hover:border-zinc-700">
      <SectionHeader
        title={title}
        description={description}
        tooltip={tooltip}
        icon={icon}
        action={
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 transition-all duration-200 hover:border-zinc-600 hover:bg-zinc-900 hover:text-white"
            aria-label={open ? "Collapse section" : "Expand section"}
          >
            {open ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
        }
      />

      {open && children}
    </section>
  );
}