export default function CardShell({ children, className = "" }) {
  return (
    <div
      className={`rounded-3xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-zinc-700 hover:bg-zinc-900/90 ${className}`}
    >
      {children}
    </div>
  );
}