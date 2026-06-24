export default function EmptyState({
  title,
  description,
  action,
}) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 p-6 text-center">
      <h3 className="text-lg font-bold text-white">{title}</h3>

      {description && (
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">
          {description}
        </p>
      )}

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}