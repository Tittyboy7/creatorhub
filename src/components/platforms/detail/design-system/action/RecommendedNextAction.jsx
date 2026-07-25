import Link from "next/link";

function getAccentClasses(accent) {
  if (accent === "green") {
    return {
      border: "border-green-500/20",
      background: "bg-green-500/10",
      eyebrow: "text-green-300",
      button:
        "border-green-500/30 bg-green-500/10 text-green-200 hover:bg-green-500/20",
    };
  }

  if (accent === "amber") {
    return {
      border: "border-amber-500/20",
      background: "bg-amber-500/10",
      eyebrow: "text-amber-300",
      button:
        "border-amber-500/30 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20",
    };
  }

  return {
    border: "border-violet-500/20",
    background: "bg-violet-500/10",
    eyebrow: "text-violet-300",
    button:
      "border-violet-500/30 bg-violet-500/10 text-violet-200 hover:bg-violet-500/20",
  };
}

export default function RecommendedNextAction({
  title,
  reason,
  href,
  buttonLabel = "Continue",
  accent = "violet",
}) {
  const styles = getAccentClasses(accent);

  return (
    <section
      className={`rounded-3xl border p-6 ${styles.border} ${styles.background}`}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p
            className={`text-xs font-semibold uppercase tracking-[0.18em] ${styles.eyebrow}`}
          >
            Next Chapter
          </p>

          <h2 className="mt-3 text-2xl font-bold text-white md:text-3xl">
            {title}
          </h2>

          <p className="mt-3 text-sm leading-7 text-zinc-300">
            {reason}
          </p>
        </div>

        <Link
          href={href}
          className={`inline-flex w-fit shrink-0 items-center rounded-2xl border px-5 py-4 text-sm font-semibold transition ${styles.button}`}
        >
          {buttonLabel}

          <span className="ml-3" aria-hidden="true">
            →
          </span>
        </Link>
      </div>
    </section>
  );
}