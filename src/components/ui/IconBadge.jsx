export default function IconBadge({ icon: Icon, label, className = "" }) {
  if (!Icon) return null;

  const isTextIcon = typeof Icon === "string";

  return (
    <span
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-white ${className}`}
      aria-label={label}
      title={label}
    >
      {isTextIcon ? Icon : <Icon className="h-5 w-5" />}
    </span>
  );
}