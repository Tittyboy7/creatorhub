"use client";

import { useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";

export default function DashboardSection({
  title,
  description,
  tooltip,
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
        action={
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="rounded-full border border-zinc-700 px-3 py-1 text-sm font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
          >
            {open ? "Hide" : "Show"}
          </button>
        }
      />

      {open && children}
    </section>
  );
}