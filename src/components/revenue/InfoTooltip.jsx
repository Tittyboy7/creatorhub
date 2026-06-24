export default function InfoTooltip({ text }) {
  if (!text) return null;

  return (
    <span className="group relative inline-flex">
      <span className="flex h-5 w-5 cursor-help items-center justify-center rounded-full border border-zinc-700 text-[11px] font-bold text-zinc-500">
        ?
      </span>

      <span className="pointer-events-none absolute left-1/2 top-7 z-50 hidden w-64 -translate-x-1/2 rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-xs font-normal leading-relaxed text-zinc-300 shadow-2xl group-hover:block">
        {text}
      </span>
    </span>
  );
}