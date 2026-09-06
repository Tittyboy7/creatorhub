import { useWorkspaceMode } from "@/context/WorkspaceModeContext";

function getHealthStyles(health) {
  switch (health) {
    case "excellent":
      return {
        label: "Excellent",
        badge:
          "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
        dot: "bg-emerald-400",
      };

    case "strong":
      return {
        label: "Strong",
        badge:
          "border-green-500/25 bg-green-500/10 text-green-300",
        dot: "bg-green-400",
      };

    case "healthy":
      return {
        label: "Healthy",
        badge:
          "border-sky-500/25 bg-sky-500/10 text-sky-300",
        dot: "bg-sky-400",
      };

    case "average":
      return {
        label: "Average",
        badge:
          "border-amber-500/25 bg-amber-500/10 text-amber-300",
        dot: "bg-amber-400",
      };

    default:
      return {
        label: "Needs Attention",
        badge:
          "border-red-500/25 bg-red-500/10 text-red-300",
        dot: "bg-red-400",
      };
  }
}

function formatConfidence(confidence) {
  if (
    typeof confidence !== "number" ||
    !Number.isFinite(confidence)
  ) {
    return null;
  }

  return `${Math.round(confidence * 100)}% confidence`;
}

function formatPublishedDate(publishedAt) {
  if (!publishedAt) {
    return null;
  }

  const date = new Date(publishedAt);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function FeaturedContentHero({
  content,
  compact = false,
}) {
  const { setMode } = useWorkspaceMode();

  if (!content) {
    return null;
  }

  const assessment =
    content.assessment;

  const healthStyles =
    getHealthStyles(
      assessment?.health
    );

  const confidence =
    formatConfidence(
      assessment?.confidence
    );

  const publishedDate =
    formatPublishedDate(
      content.publishedAt
    );

function handleReviewPerformance() {
  setMode("analytics");

  window.requestAnimationFrame(() => {
    document
      .getElementById("content-performance")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  });
}

  return (
    <article className="group overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/20">
      <div
        className={`relative overflow-hidden bg-gradient-to-br from-violet-600/25 via-zinc-900 to-red-500/15 ${
          compact ? "h-40" : "aspect-video"
        }`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.3),transparent_48%)]" />

        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(9,9,11,0.88),transparent_60%)]" />

        <div className="absolute left-4 top-4">
          <span className="inline-flex items-center rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur">
            Featured Upload
          </span>
        </div>

        {assessment ? (
          <div className="absolute right-4 top-4">
            <span
              className={`
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                px-3
                py-1
                text-xs
                font-semibold
                backdrop-blur
                ${healthStyles.badge}
              `}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${healthStyles.dot}`}
              />

              {healthStyles.label}
            </span>
          </div>
        ) : null}

        <div className="absolute inset-0 flex items-center justify-center">
          <button
            type="button"
            aria-label={`Open ${content.title}`}
            className="flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/30 bg-violet-500/20 text-2xl text-violet-100 shadow-xl shadow-violet-950/50 backdrop-blur transition duration-300 group-hover:scale-105 group-hover:bg-violet-500/30"
          >
            ▶
          </button>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <p className="line-clamp-2 text-lg font-bold leading-snug text-white">
            {content.title}
          </p>
        </div>
      </div>

      <div className={compact ? "space-y-4 p-4" : "space-y-5 p-5"}>
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            {content.assetType ? (
              <span className="capitalize">
                {content.assetType}
              </span>
            ) : null}

            {content.assetType &&
            publishedDate ? (
              <span aria-hidden="true">•</span>
            ) : null}

            {publishedDate ? (
              <span>
                Published {publishedDate}
              </span>
            ) : null}
          </div>

          {content.metric ? (
            <p className="mt-3 text-sm leading-6 text-zinc-300">
              {content.metric}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {content.comparison ? (
              <span className="inline-flex rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-200">
                {content.comparison}
              </span>
            ) : null}

            {confidence ? (
              <span className="inline-flex rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-400">
                {confidence}
              </span>
            ) : null}
          </div>
        </div>

        {assessment?.summary && !compact ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Business Assessment
            </p>

            <p className="mt-2 text-sm leading-6 text-zinc-300">
              {assessment.summary}
            </p>
          </div>
        ) : null}

        {content.recommendation && !compact ? (
          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-300">
              Recommended Next Action
            </p>

            <p className="mt-2 text-sm leading-6 text-zinc-300">
              {content.recommendation}
            </p>
          </div>
        ) : null}

        {compact ? (
          <button
            type="button"
            onClick={handleReviewPerformance}
            className="inline-flex w-full items-center justify-center rounded-xl border border-violet-500/25 bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-200 transition hover:bg-violet-500/20"
          >
            Review Performance
            <span aria-hidden="true" className="ml-2">
              →
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleReviewPerformance}
            className="inline-flex w-full items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-100"
          >
            Review Content Performance
            <span aria-hidden="true" className="ml-2">
              →
            </span>
          </button>
        )}
      </div>
    </article>
  );
}