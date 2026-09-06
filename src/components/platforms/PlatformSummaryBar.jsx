function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function SummaryCard({
  label,
  value,
  helper,
  icon,
  tone = "zinc",
}) {
  const toneStyles = {
    blue: {
      icon:
        "border-blue-500/30 bg-blue-500/10 text-blue-300",
      glow:
        "shadow-[0_0_28px_rgba(59,130,246,0.05)]",
    },

    green: {
      icon:
        "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
      glow:
        "shadow-[0_0_28px_rgba(16,185,129,0.05)]",
    },

    amber: {
      icon:
        "border-amber-500/30 bg-amber-500/10 text-amber-300",
      glow:
        "shadow-[0_0_28px_rgba(245,158,11,0.05)]",
    },

    violet: {
      icon:
        "border-violet-500/30 bg-violet-500/10 text-violet-300",
      glow:
        "shadow-[0_0_28px_rgba(139,92,246,0.05)]",
    },

    zinc: {
      icon:
        "border-zinc-700 bg-zinc-800 text-zinc-300",
      glow: "",
    },
  };

  const styles =
    toneStyles[tone] || toneStyles.zinc;

  return (
    <article
      className={`
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        border-zinc-800
        bg-zinc-900/70
        p-4
        backdrop-blur
        transition
        hover:-translate-y-0.5
        hover:border-zinc-700
        ${styles.glow}
      `}
    >
      <div className="flex items-start gap-4">
        <div
          className={`
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-2xl
            border
            ${styles.icon}
          `}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium text-zinc-400">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold tracking-tight text-white">
            {value}
          </p>

          <p className="mt-1 text-xs leading-5 text-zinc-500">
            {helper}
          </p>
        </div>
      </div>
    </article>
  );
}

export default function PlatformSummaryBar({
  platforms,
}) {
  const connectedCount = platforms.length;

  const healthyCount = platforms.filter(
    (platform) =>
      platform.status === "healthy"
  ).length;

  const attentionCount = platforms.filter(
    (platform) =>
      platform.status === "attention"
  ).length;

  const trackedRevenue =
    platforms.reduce(
      (total, platform) =>
        total +
        (
          Number(
            platform.summaryRevenue
          ) || 0
        ),
      0
    );

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        label="Connected Platforms"
        value={connectedCount}
        helper="All active platform connections"
        tone="blue"
        icon={
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            className="h-5 w-5"
          >
            <path
              d="M8.5 15.5l7-7"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M7 10.5 4.8 12.7a4 4 0 0 0 5.7 5.7l2.2-2.2"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="m17 13.5 2.2-2.2a4 4 0 1 0-5.7-5.7l-2.2 2.2"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        }
      />

      <SummaryCard
        label="Business Health"
        value={
          attentionCount > 0
            ? "Needs Review"
            : "Healthy"
        }
        helper={`${healthyCount} healthy · ${attentionCount} needs attention`}
        tone={
          attentionCount > 0
            ? "amber"
            : "green"
        }
        icon={
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            className="h-5 w-5"
          >
            <path
              d="M20.8 5.8a5.4 5.4 0 0 0-7.6 0L12 7l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 22l8.8-8.6a5.4 5.4 0 0 0 0-7.6Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d="M7 12h2.3l1.2-2.6 2.1 5.2 1.3-2.6H17"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        }
      />

      <SummaryCard
        label="Platforms Needing Attention"
        value={attentionCount}
        helper={
          attentionCount > 0
            ? "Review recommended"
            : "No issues detected"
        }
        tone="amber"
        icon={
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            className="h-5 w-5"
          >
            <path
              d="M12 8v5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M12 16.5h.01"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <path
              d="M10.3 4.8 3.6 17a2 2 0 0 0 1.8 3h13.2a2 2 0 0 0 1.8-3L13.7 4.8a2 2 0 0 0-3.4 0Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
        }
      />

      <SummaryCard
        label="Tracked Revenue"
        value={formatCurrency(
          trackedRevenue
        )}
        helper="Across supported revenue sources today"
        tone="violet"
        icon={
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            className="h-5 w-5"
          >
            <path
              d="M12 3v18"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M16 7.5c0-1.7-1.8-3-4-3s-4 1.3-4 3 1.8 3 4 3 4 1.3 4 3-1.8 3-4 3-4-1.3-4-3"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        }
      />
    </section>
  );
}