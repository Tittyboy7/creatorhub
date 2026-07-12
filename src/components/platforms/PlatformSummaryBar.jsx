function SummaryCard({ label, value, helper }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <div className="mt-1 flex items-end justify-between gap-3">
        <p className="text-xl font-bold text-white">{value}</p>
        <p className="text-xs text-zinc-500">{helper}</p>
      </div>
    </div>
  );
}

export default function PlatformSummaryBar({ platforms }) {
  const connectedCount = platforms.length;
  const healthyCount = platforms.filter(
    (platform) => platform.status === "healthy"
  ).length;
  const attentionCount = platforms.filter(
    (platform) => platform.status === "attention"
  ).length;

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard label="Connected" value={connectedCount} helper="Platforms" />
      <SummaryCard label="Healthy" value={healthyCount} helper="Normal" />
      <SummaryCard label="Attention" value={attentionCount} helper="Review" />
      <SummaryCard label="Today" value="$1,148" helper="Tracked total" />
    </section>
  );
}