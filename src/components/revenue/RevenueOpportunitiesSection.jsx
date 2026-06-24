import InfoTooltip from "./InfoTooltip";

function OpportunityCard({ title, description, action }) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
        Opportunity
      </p>

      <h3 className="mt-2 text-xl font-bold">{title}</h3>

      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
        {description}
      </p>

      <p className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-3 text-sm font-semibold text-white">
        {action}
      </p>
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
      title: bestPlatform?.platform
        ? `Expand your strongest platform ${bestPlatform.platform}`
        : "Connect more revenue sources",
      description: bestPlatform?.platform
        ? `${bestPlatform.platform} is currently one of your strongest tracked revenue sources. Creators usually grow faster when they identify what is already working and build around it.`
        : "The more platforms you connect, the clearer your business picture becomes.",
      action: bestPlatform?.platform
        ? `Review what is driving ${bestPlatform.platform} revenue and create more of it.`
        : "Connect another platform to improve your dashboard insights.",
    },
    {
      title:
        monthlyGrowthPercent >= 0
          ? "Protect your current momentum"
          : "Find the revenue dip",
      description:
        monthlyGrowthPercent >= 0
          ? "Your tracked revenue trend is positive. The next goal is to understand which platforms are causing the growth."
          : "Your tracked revenue trend is down. This usually means one platform, product, or revenue type needs attention.",
      action:
        monthlyGrowthPercent >= 0
          ? "Compare your top platform against your second-best platform."
          : "Check your Revenue Timeline to find where the drop started.",
    },
    {
      title:
        topPlatformPercent >= 60
          ? "Reduce platform dependency"
          : "Revenue mix looks healthier",
      description:
        topPlatformPercent >= 60
          ? "One platform appears to be carrying most of the revenue. That can be risky if platform rules, traffic, or payouts change."
          : "Your revenue appears to be spread across multiple sources, which is healthier for long-term creator stability.",
      action:
        topPlatformPercent >= 60
          ? "Build a second strong revenue channel."
          : "Keep growing your strongest two platforms.",
    },
    {
      title:
        platformCount >= 4
          ? "You have enough data for strategy"
          : "More connections will improve recommendations",
      description:
        platformCount >= 4
          ? "With multiple platforms connected, CreatorsHub can start giving stronger business recommendations."
          : "Recommendations become more useful when more revenue platforms are connected.",
      action:
        platformCount >= 4
          ? "Use this dashboard weekly to decide what to create, promote, or sell next."
          : "Connect one more revenue platform when available.",
    },
  ];

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
      <div className="grid gap-4 md:grid-cols-2">
        {opportunities.map((opportunity) => (
          <OpportunityCard
            key={opportunity.title}
            title={opportunity.title}
            description={opportunity.description}
            action={opportunity.action}
          />
        ))}
      </div>
    </section>
  );
}