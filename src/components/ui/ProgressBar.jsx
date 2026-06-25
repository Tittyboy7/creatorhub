export default function ProgressBar({ value = 0, className = "" }) {
  const safeValue = Math.min(Math.max(Number(value || 0), 0), 100);

  return (
    <div className={`h-3 overflow-hidden rounded-full bg-zinc-800 ${className}`}>
      <div
        className="h-full rounded-full bg-white transition-all duration-700 ease-out"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}