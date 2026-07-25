function getAccentClasses(accent) {
  if (accent === "green") {
    return {
      number:
        "border-green-500/30 bg-green-500/10 text-green-300",
      action: "text-green-300",
    };
  }

  if (accent === "blue") {
    return {
      number:
        "border-blue-500/30 bg-blue-500/10 text-blue-300",
      action: "text-blue-300",
    };
  }

  if (accent === "amber") {
    return {
      number:
        "border-amber-500/30 bg-amber-500/10 text-amber-300",
      action: "text-amber-300",
    };
  }

  if (accent === "cyan") {
    return {
      number:
        "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
      action: "text-cyan-300",
    };
  }

  if (accent === "pink") {
    return {
      number:
        "border-pink-500/30 bg-pink-500/10 text-pink-300",
      action: "text-pink-300",
    };
  }

  return {
    number:
      "border-violet-500/30 bg-violet-500/15 text-violet-200",
    action: "text-violet-300",
  };
}

export default function PlatformChapterHeader({
  number,
  title,
  description,
  accent = "violet",
  isExpanded,
  onToggle,
  expandedLabel = "Expanded ↑",
  collapsedLabel = "View Report →",
  controls,
}) {
  const styles = getAccentClasses(accent);

  return (
    <button
      type="button"
      aria-expanded={isExpanded}
      aria-controls={controls}
      onClick={onToggle}
      className="flex w-full items-start justify-between gap-5 p-5 text-left transition hover:bg-zinc-800/40 md:p-6"
    >
      <div className="flex min-w-0 items-start gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border text-lg font-bold ${styles.number}`}
        >
          {number}
        </div>

        <div>
          <h2 className="text-xl font-bold text-white md:text-2xl">
            {title}
          </h2>

          {description && (
            <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500">
              {description}
            </p>
          )}
        </div>
      </div>

      <span className={`shrink-0 text-sm font-semibold ${styles.action}`}>
        {isExpanded ? expandedLabel : collapsedLabel}
      </span>
    </button>
  );
}