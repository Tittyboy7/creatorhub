function getCardStyles(type) {
  switch (type) {
    case "top":
      return {
        eyebrow: "Top Performer",
        border: "border-emerald-500/20",
        background:
          "bg-gradient-to-br from-emerald-500/10 to-zinc-950",
        iconBackground:
          "border-emerald-500/25 bg-emerald-500/10",
        iconText: "text-emerald-300",
        icon: "↗",
      };

    case "watch-time":
      return {
        eyebrow: "Highest Watch Time",
        border: "border-violet-500/20",
        background:
          "bg-gradient-to-br from-violet-500/10 to-zinc-950",
        iconBackground:
          "border-violet-500/25 bg-violet-500/10",
        iconText: "text-violet-300",
        icon: "◷",
      };

    case "engagement":
      return {
        eyebrow: "Best Engagement",
        border: "border-sky-500/20",
        background:
          "bg-gradient-to-br from-sky-500/10 to-zinc-950",
        iconBackground:
          "border-sky-500/25 bg-sky-500/10",
        iconText: "text-sky-300",
        icon: "◎",
      };

    default:
      return {
        eyebrow: "Needs Attention",
        border: "border-amber-500/20",
        background:
          "bg-gradient-to-br from-amber-500/10 to-zinc-950",
        iconBackground:
          "border-amber-500/25 bg-amber-500/10",
        iconText: "text-amber-300",
        icon: "!",
      };
  }
}

function formatCompactNumber(value) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return "0";
  }

  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatHours(value) {
  return `${formatCompactNumber(value)} hrs`;
}

function PerformanceLeaderCard({
  item,
  type,
  detail,
}) {
  if (!item) {
    return null;
  }

  const styles = getCardStyles(type);

  return (
    <article
      className={`
        rounded-2xl
        border
        p-4
        ${styles.border}
        ${styles.background}
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
            {styles.eyebrow}
          </p>

          <h4 className="mt-2 line-clamp-2 text-sm font-semibold leading-5 text-white">
            {item.title}
          </h4>
        </div>

        <span
          className={`
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            text-sm
            font-bold
            ${styles.iconBackground}
            ${styles.iconText}
          `}
        >
          {styles.icon}
        </span>
      </div>

      <p className="mt-4 text-lg font-bold text-white">
        {detail}
      </p>

      {item.assessment?.summary ? (
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-500">
          {item.assessment.summary}
        </p>
      ) : null}
    </article>
  );
}

export default function PerformanceLeaders({
  rankedContent,
}) {
  if (!rankedContent) {
    return null;
  }

  const {
    topPerformer,
    watchTimeLeader,
    engagementLeader,
    underperformer,
  } = rankedContent;

  return (
    <section className="border-t border-zinc-800 pt-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-300">
          Performance Analysis
        </p>

        <h3 className="mt-1 text-lg font-bold text-white">
          Content Leaders
        </h3>

        <p className="mt-1 text-sm text-zinc-500">
          Identify which uploads are driving results and which deserve attention.
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <PerformanceLeaderCard
          item={topPerformer}
          type="top"
          detail={`${formatCompactNumber(
            topPerformer?.views || 0
          )} views`}
        />

        <PerformanceLeaderCard
          item={watchTimeLeader}
          type="watch-time"
          detail={formatHours(
            watchTimeLeader?.watchTimeHours || 0
          )}
        />

        <PerformanceLeaderCard
          item={engagementLeader}
          type="engagement"
          detail={`${formatCompactNumber(
            (engagementLeader?.subscribersGained || 0)
          )} subscribers`}
        />

        <PerformanceLeaderCard
          item={underperformer}
          type="attention"
          detail={`${formatCompactNumber(
            underperformer?.views || 0
          )} views`}
        />
      </div>
    </section>
  );
}