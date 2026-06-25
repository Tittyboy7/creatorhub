import Link from "next/link";

function OpportunityCard({
  label,
  title,
  description,
  action,
  href = "/revenue",
  priority = "low",
}) {
  const priorityStyles = {
    high: "border-red-500/30 bg-red-500/10 text-red-300",
    medium: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    low: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  };

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {label}
        </p>

        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${
            priorityStyles[priority] || priorityStyles.low
          }`}
        >
          {priority}
        </span>
      </div>

      <h3 className="mt-3 text-xl font-bold">{title}</h3>

      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
        {description}
      </p>

      <Link
        href={href}
        className="mt-4 inline-flex rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm font-semibold text-white hover:border-zinc-700 hover:bg-zinc-900"
      >
        {action} →
      </Link>
    </div>
  );
}

export default function RevenueOpportunitiesSection({
  bestPlatform,
  monthlyGrowthPercent,
  platformCount,
  topPlatformPercent,
}) {
  const opportunities = [
    {
      label: "Growth",
      priority: "medium",
      href: "/revenue",
      title: bestPlatform?.platform
        ? `Double down on ${bestPlatform.platform}`
        : "Connect more revenue sources",
      description: bestPlatform?.platform
        ? `${bestPlatform.platform} is currently your strongest tracked revenue source. This is where your business is already showing traction.`
        : "The more platforms you connect, the clearer your business picture becomes.",
      action: bestPlatform?.platform
        ? `Review ${bestPlatform.platform} revenue`
        : "Connect another platform",
    },
    {
      label: monthlyGrowthPercent >= 0 ? "Momentum" : "Warning",
      priority: monthlyGrowthPercent >= 0 ? "low" : "high",
      href: "/revenue",
      title:
        monthlyGrowthPercent >= 0
          ? "Momentum is moving in the right direction"
          : "Revenue momentum needs attention",
      description:
        monthlyGrowthPercent >= 0
          ? "Your tracked revenue trend is positive. The next step is identifying which source is causing the growth."
          : "Your tracked revenue trend is down. One platform, product, or revenue type may be pulling performance lower.",
      action:
        monthlyGrowthPercent >= 0
          ? "Compare revenue sources"
          : "Review revenue timeline",
    },
    {
      label: topPlatformPercent >= 60 ? "Risk" : "Stability",
      priority: topPlatformPercent >= 60 ? "high" : "low",
      href: "/revenue",
      title:
        topPlatformPercent >= 60
          ? "Your revenue is concentrated"
          : "Your revenue mix looks healthier",
      description:
        topPlatformPercent >= 60
          ? "One platform appears to be carrying most of the revenue. That creates risk if traffic, payouts, or platform rules change."
          : "Your revenue appears to be spread across multiple sources, which is healthier for long-term creator stability.",
      action:
        topPlatformPercent >= 60
          ? "Review platform mix"
          : "View revenue mix",
    },
    {
      label: "Data Quality",
      priority: platformCount >= 4 ? "low" : "medium",
      href: "/connected-accounts",
      title:
        platformCount >= 4
          ? "You have enough data for stronger strategy"
          : "More connections will improve recommendations",
      description:
        platformCount >= 4
          ? "With multiple platforms connected, CreatorsHub can start identifying stronger business patterns."
          : "Recommendations become more useful when more revenue platforms are connected.",
      action:
        platformCount >= 4
          ? "Manage integrations"
          : "Connect another platform",
    },
  ];

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
      <div className="grid gap-4 md:grid-cols-2">
        {opportunities.map((opportunity) => (
          <OpportunityCard
            key={opportunity.title}
            label={opportunity.label}
            title={opportunity.title}
            description={opportunity.description}
            action={opportunity.action}
            href={opportunity.href}
            priority={opportunity.priority}
          />
        ))}
      </div>
    </section>
  );
}