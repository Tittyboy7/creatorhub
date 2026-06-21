export default function KpiCard({ label, value, subvalue, valueClass = "" }) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className={`mt-2 line-clamp-1 text-2xl font-bold ${valueClass}`}>
        {value}
      </p>
      {subvalue && <p className="mt-1 text-xs text-zinc-500">{subvalue}</p>}
    </div>
  );
}