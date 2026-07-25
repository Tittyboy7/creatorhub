function getAccentClasses(accent) {
  if (accent === "green") {
    return {
      container: "border-green-500/20 bg-green-500/10",
      eyebrow: "text-green-300",
      button:
        "border-green-500/30 bg-green-500/10 text-green-200 hover:bg-green-500/20",
    };
  }

  if (accent === "blue") {
    return {
      container: "border-blue-500/20 bg-blue-500/10",
      eyebrow: "text-blue-300",
      button:
        "border-blue-500/30 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20",
    };
  }

  if (accent === "amber") {
    return {
      container: "border-amber-500/20 bg-amber-500/10",
      eyebrow: "text-amber-300",
      button:
        "border-amber-500/30 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20",
    };
  }

  if (accent === "cyan") {
    return {
      container: "border-cyan-500/20 bg-cyan-500/10",
      eyebrow: "text-cyan-300",
      button:
        "border-cyan-500/30 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20",
    };
  }

  if (accent === "pink") {
    return {
      container: "border-pink-500/20 bg-pink-500/10",
      eyebrow: "text-pink-300",
      button:
        "border-pink-500/30 bg-pink-500/10 text-pink-200 hover:bg-pink-500/20",
    };
  }

  return {
    container: "border-violet-500/20 bg-violet-500/10",
    eyebrow: "text-violet-300",
    button:
      "border-violet-500/30 bg-violet-500/10 text-violet-200 hover:bg-violet-500/20",
  };
}

export default function PlatformInsightCard({
  insight,
  actionLabel,
  accent = "violet",
  onAction,
  className = "",
}) {
  const styles = getAccentClasses(accent);

  return (
    <div
      className={`rounded-2xl border p-5 ${styles.container} ${className}`}
    >
      <p
        className={`text-xs font-semibold uppercase tracking-wide ${styles.eyebrow}`}
      >
        AI Insight
      </p>

      <p className="mt-3 text-sm leading-6 text-zinc-300">{insight}</p>

      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className={`mt-5 inline-flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition ${styles.button}`}
        >
          {actionLabel}
          <span aria-hidden="true">→</span>
        </button>
      )}
    </div>
  );
}