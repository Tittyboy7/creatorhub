function formatPublishedDate(publishedAt) {
  if (!publishedAt) {
    return "Publish date unavailable";
  }

  const date = new Date(publishedAt);

  if (Number.isNaN(date.getTime())) {
    return "Publish date unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function getHealthStyles(health) {
  switch (health) {
    case "excellent":
      return {
        label: "Excellent",
        className:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
      };

    case "strong":
      return {
        label: "Strong",
        className:
          "border-green-500/20 bg-green-500/10 text-green-300",
      };

    case "healthy":
      return {
        label: "Healthy",
        className:
          "border-sky-500/20 bg-sky-500/10 text-sky-300",
      };

    case "average":
      return {
        label: "Average",
        className:
          "border-amber-500/20 bg-amber-500/10 text-amber-300",
      };

    default:
      return {
        label: "Needs Attention",
        className:
          "border-red-500/20 bg-red-500/10 text-red-300",
      };
  }
}

function RecentUploadCard({
  upload,
  rank,
}) {
  const healthStyles = getHealthStyles(
    upload.assessment?.health
  );

  return (
    <article className="group min-w-[230px] flex-1 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 transition duration-300 hover:-translate-y-0.5 hover:border-violet-500/30">
      <div className="relative h-28 overflow-hidden bg-gradient-to-br from-violet-500/20 via-zinc-900 to-red-500/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.2),transparent_50%)]" />

        <div className="absolute left-3 top-3">
          <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg border border-white/10 bg-black/40 px-2 text-xs font-bold text-white backdrop-blur">
            #{rank}
          </span>
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/15 text-violet-200 transition group-hover:scale-105">
            ▶
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-white">
            {upload.title}
          </p>

          {upload.assessment ? (
            <span
              className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold ${healthStyles.className}`}
            >
              {healthStyles.label}
            </span>
          ) : null}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 text-xs">
          <span className="font-semibold text-zinc-300">
            {upload.metric}
          </span>

          <span className="text-zinc-600">
            {formatPublishedDate(
              upload.publishedAt
            )}
          </span>
        </div>

        <button
          type="button"
          className="mt-4 inline-flex items-center text-xs font-semibold text-violet-300 transition hover:text-violet-200"
        >
          Review upload
          <span
            aria-hidden="true"
            className="ml-2"
          >
            →
          </span>
        </button>
      </div>
    </article>
  );
}

export default function RecentUploadsStrip({
  uploads = [],
}) {
  if (!uploads.length) {
    return null;
  }

  return (
    <section className="border-t border-zinc-800 pt-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-300">
            Content Library
          </p>

          <h3 className="mt-1 text-lg font-bold text-white">
            Recent Uploads
          </h3>

          <p className="mt-1 text-sm text-zinc-500">
            Review how your latest published content is performing.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex w-fit items-center text-sm font-semibold text-zinc-400 transition hover:text-white"
        >
          View all content
          <span
            aria-hidden="true"
            className="ml-2"
          >
            →
          </span>
        </button>
      </div>

      <div className="mt-5 flex gap-4 overflow-x-auto pb-2">
        {uploads.map((upload, index) => (
          <RecentUploadCard
            key={upload.id}
            upload={upload}
            rank={index + 1}
          />
        ))}
      </div>
    </section>
  );
}