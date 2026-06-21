export default function SmallInfoCard({ label, value, description }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 text-xl font-bold">{value}</p>
      <p className="mt-2 text-sm text-zinc-400">{description}</p>
    </div>
  );
}