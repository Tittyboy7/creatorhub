"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function ExpandableSection({
  title,
  description,
  defaultOpen = false,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <div>
          <h2 className="text-xl font-bold text-white">{title}</h2>

          {description ? (
            <p className="mt-1 text-sm text-zinc-500">{description}</p>
          ) : null}
        </div>

        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-900 hover:text-white">
          {open ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </span>
      </button>

      {open ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}