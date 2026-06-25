export default function CardShell({ children, className = "" }) {
  return (
    <div
      className={`rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-700 hover:bg-zinc-900 ${className}`}
    >
      {children}
    </div>
  );
}