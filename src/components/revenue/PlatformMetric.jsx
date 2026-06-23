export default function PlatformMetric({ label, value }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 overflow-hidden">
      <p className="text-xs text-zinc-500">{label}</p>

      <p
        className="mt-1 truncate text-sm font-semibold"
        title={String(value)}
      >
        {value}
      </p>
    </div>
  );
}