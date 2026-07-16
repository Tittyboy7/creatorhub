import Link from "next/link";

export default function BusinessTodaySection({
  businessSummary,
  businessSignals = [],
  businessCauses = [],
  totalRevenue = 0,
  revenueThisMonth = 0,
  hasCurrentMonthRevenueData = false,
  totalFollowers = 0,
  productsCount = 0,
  completedSetupCount = 0,
  setupItemCount = 0,
}) {
  const setupScore =
    setupItemCount > 0
      ? Math.round(
          (Number(completedSetupCount || 0) / setupItemCount) * 100
        )
      : 0;

  const integrationSummary = businessSummary?.integrations || {};
  const revenueSummary = businessSummary?.revenue || {};
  const dataQuality = businessSummary?.dataQuality || {};

  const healthyConnections = Number(
    integrationSummary.healthyConnections || 0
  );

  const connectionsNeedingAttention = Number(
    integrationSummary.connectionsNeedingAttention || 0
  );

  const connectedAccounts = Number(
    integrationSummary.connectedAccounts || 0
  );

  const dataConfidenceScore = {
    high: 100,
    medium: 70,
    low: 40,
  }[dataQuality.confidence] || 40;

  const integrationHealthScore =
    connectedAccounts === 0
      ? 35
      : Math.round(
          (healthyConnections / connectedAccounts) * 100
        );

  const revenueHealthScore =
    Number(revenueSummary.total || totalRevenue) > 0 ? 100 : 35;

  const baseBusinessHealthScore = Math.min(
    100,
    Math.round(
      setupScore * 0.2 +
        integrationHealthScore * 0.3 +
        revenueHealthScore * 0.3 +
        dataConfidenceScore * 0.2
    )
  );

  const connectionPenalty =
    connectionsNeedingAttention > 0
      ? Math.min(30, connectionsNeedingAttention * 10)
      : 0;

  const businessHealthScore = Math.max(
    0,
    baseBusinessHealthScore - connectionPenalty
  );

  const healthLabel = getHealthLabel({
    score: businessHealthScore,
    connectionsNeedingAttention,
  });

  const prioritySignal = businessSignals[0] || null;

  const priorityCause =
    businessCauses.find(
      (cause) =>
        cause.signalId === prioritySignal?.id &&
        cause.metadata?.primary
    ) ||
    businessCauses.find(
      (cause) => cause.signalId === prioritySignal?.id
    ) ||
    null;

  const briefItems = buildBriefItems({
    businessSummary,
    businessSignals,
    prioritySignalId: prioritySignal?.id,
    totalRevenue,
    revenueThisMonth,
    hasCurrentMonthRevenueData,
    totalFollowers,
    productsCount,
  });

  const briefNarrative = buildBriefNarrative({
    businessSummary,
    prioritySignal,
    revenueThisMonth,
  });

  const recommendationTitle =
    prioritySignal?.title || "Build a stronger business data foundation";

  const recommendationDetail =
    priorityCause?.explanation ||
    prioritySignal?.reason ||
    "Connect platforms and track your revenue consistently so CreatorsHub can identify stronger opportunities and risks.";

  const recommendedAction = prioritySignal?.action || {
    label:
      connectedAccounts > 0
        ? "Open Revenue Intelligence"
        : "Connect a Platform",
    href:
      connectedAccounts > 0
        ? "/revenue"
        : "/connected-accounts",
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
      <div className="border-b border-zinc-800 px-5 py-4 md:px-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">
          Business Today
        </p>

        <h2 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">
          Here&apos;s what needs your attention.
        </h2>
      </div>

      <div
        className="grid divide-y divide-zinc-800 md:divide-x md:divide-y-0"
        style={{
          gridTemplateColumns: "0.8fr 1.2fr 1fr",
        }}
      >
        <div className="bg-zinc-950/40 p-5 md:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Business Health
          </p>

          <p className="mt-3 text-5xl font-black text-white">
            {businessHealthScore}
          </p>

          <p
            className={`mt-2 text-sm font-semibold ${getHealthTextClass(
              healthLabel
            )}`}
          >
            {healthLabel}
          </p>

          <p className="mt-4 text-sm leading-6 text-zinc-400">
            Based on integration health, tracked revenue, available business
            data, and account setup.
          </p>
        </div>

        <div className="bg-zinc-950/40 p-5 md:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Today&apos;s Brief
          </p>

          <p className="mt-3 text-sm leading-6 text-zinc-300">
            {briefNarrative}
          </p>

          <div className="mt-4 space-y-3">
            {briefItems.map((item) => (
              <BriefItem
                key={item.id}
                label={item.label}
                detail={item.detail}
                importance={item.importance}
              />
            ))}
          </div>
        </div>

        <div className="bg-emerald-500/5 p-5 md:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
            Recommended Focus
          </p>

          <h3 className="mt-3 text-xl font-bold text-white">
            {recommendationTitle}
          </h3>

          <p className="mt-3 text-sm leading-6 text-zinc-300">
            {recommendationDetail}
          </p>

          <div className="mt-4 border-t border-emerald-500/20 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
              Suggested action
            </p>

            <Link
              href={recommendedAction.href}
              className="mt-2 inline-flex text-sm font-semibold text-emerald-100 hover:text-white"
            >
              {recommendedAction.label} →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function buildBriefNarrative({
  businessSummary,
  prioritySignal,
  revenueThisMonth,
}) {
  const integrations = businessSummary?.integrations || {};
  const revenue = businessSummary?.revenue || {};
  const dataQuality = businessSummary?.dataQuality || {};

  const connectionsNeedingAttention = Number(
    integrations.connectionsNeedingAttention || 0
  );

  const monthlyGrowthPercent = Number(
    revenue.monthlyGrowthPercent || 0
  );

  if (
    prioritySignal?.id === "integration-health-warning" &&
    connectionsNeedingAttention > 0
  ) {
    return connectionsNeedingAttention === 1
      ? "One connected platform needs attention, so parts of today’s business analysis may be incomplete. Repair that connection before relying on its newest metrics."
      : `${connectionsNeedingAttention} connected platforms need attention, so parts of today’s business analysis may be incomplete. Repair those connections before relying on their newest metrics.`;
  }

  if (monthlyGrowthPercent > 0) {
    return `Tracked revenue increased ${monthlyGrowthPercent}% compared with the previous tracked month. Review the strongest revenue sources to identify what may be worth repeating.`;
  }

  if (monthlyGrowthPercent < 0) {
    return `Tracked revenue decreased ${Math.abs(
      monthlyGrowthPercent
    )}% compared with the previous tracked month. Review the revenue timeline before changing your strategy.`;
  }

  if (Number(revenueThisMonth || 0) > 0) {
    return `${formatCurrency(
      revenueThisMonth
    )} has been tracked this month. CreatorsHub has not detected a major month-over-month movement yet.`;
  }

  if (dataQuality.confidence === "low") {
    return "CreatorsHub is still building a reliable picture of your business. Connecting more platforms and tracking revenue consistently will improve today’s recommendations.";
  }

  return "No major business movement has been confirmed for the current period. Review the supporting metrics below and keep your connected platforms synchronized.";
}

function buildBriefItems({
  businessSummary,
  businessSignals,
  prioritySignalId,
  totalRevenue,
  revenueThisMonth,
  hasCurrentMonthRevenueData,
  totalFollowers,
  productsCount,
}) {

  const items = [];

  const audienceSummary = businessSummary?.audience || {};

  const commerceSummary = businessSummary?.commerce || {};

  const commerceRevenue = Number(
    commerceSummary.revenue || 0
  );

  const commerceOrders = Number(
    commerceSummary.orders || 0
  );

  const commerceProducts = Number(
    commerceSummary.products || 0
  );

  const averageOrderValue = Number(
    commerceSummary.averageOrderValue || 0
  );

  const platformSubscribers = Number(
    audienceSummary.subscribers || 0
  );

  const platformFollowers = Number(
    audienceSummary.followers || 0
  );

  const platformViews = Number(
    audienceSummary.views || 0
  );

  const monthlyGrowthPercent = Number(
    businessSummary?.revenue?.monthlyGrowthPercent || 0
  );

  items.push({
    id: "revenue",
    label:
      monthlyGrowthPercent > 0
        ? `Revenue increased ${monthlyGrowthPercent}%`
        : monthlyGrowthPercent < 0
          ? `Revenue decreased ${Math.abs(monthlyGrowthPercent)}%`
          : hasCurrentMonthRevenueData
            ? `Revenue this month: ${formatCurrency(revenueThisMonth)}`
            : "No revenue recorded this month yet",

    detail: hasCurrentMonthRevenueData
      ? `Lifetime tracked revenue: ${formatCurrency(
          businessSummary?.revenue?.total || totalRevenue
        )}`
      : `CreatorsHub needs a current-month entry before comparing revenue with the previous month. Lifetime tracked revenue is ${formatCurrency(
          businessSummary?.revenue?.total || totalRevenue
        )}.`,
    importance:
      monthlyGrowthPercent < 0
        ? "high"
        : monthlyGrowthPercent > 0
          ? "medium"
          : "low",
  });

  const additionalSignals = businessSignals
    .filter((signal) => signal.id !== prioritySignalId)
    .filter((signal) => signal.id !== "revenue-growth-positive")
    .filter((signal) => signal.id !== "revenue-growth-negative")
    .slice(0, 2);

  additionalSignals.forEach((signal) => {
    items.push({
      id: signal.id,
      label: signal.title,
      detail: signal.reason,
      importance: getSignalImportance(signal.severity),
    });
  });

  if (items.length < 3) {
    const audienceCount =
      platformSubscribers ||
      platformFollowers ||
      Number(totalFollowers || 0);

    const audienceLabel = platformSubscribers
      ? `${formatNumber(platformSubscribers)} platform subscribers tracked`
      : platformFollowers
        ? `${formatNumber(platformFollowers)} platform followers tracked`
        : `${formatNumber(totalFollowers)} marketplace followers tracked`;

    const audienceDetail =
      platformViews > 0
        ? `${formatNumber(
            platformViews
          )} total platform views are currently available for audience analysis.`
        : "Audience intelligence will become more detailed as historical platform snapshots are collected.";

    items.push({
      id: "audience",
      label:
        audienceCount > 0
          ? audienceLabel
          : "Audience data is still limited",
      detail: audienceDetail,
      importance: audienceCount > 0 ? "medium" : "low",
    });
  }

  if (items.length < 3) {
    const marketplaceProducts = Number(productsCount || 0);

    const hasConnectedCommerceProducts =
      commerceProducts > 0;

    const trackedProducts = hasConnectedCommerceProducts
      ? commerceProducts
      : marketplaceProducts;

    let label = hasConnectedCommerceProducts
      ? `${formatNumber(
          trackedProducts
        )} connected commerce products tracked`
      : `${formatNumber(
          trackedProducts
        )} marketplace products listed`;

    let detail = hasConnectedCommerceProducts
      ? `${formatNumber(
          marketplaceProducts
        )} additional products are listed in the CreatorsHub marketplace.`
      : "Commerce recommendations will improve as product, order, and customer data expands.";

    let importance = "low";

    if (commerceOrders > 0) {
      label = `${formatNumber(commerceOrders)} commerce orders tracked`;
      detail =
        averageOrderValue > 0
          ? `Average order value is ${formatCurrency(
              averageOrderValue
            )}.`
          : `${formatCurrency(
              commerceRevenue
            )} in connected commerce revenue is currently available.`;
        importance = "medium";
    } else if (commerceRevenue > 0) {
      label = `${formatCurrency(
        commerceRevenue
      )} in commerce revenue tracked`;
      detail =
        trackedProducts > 0
          ? hasConnectedCommerceProducts
            ? `${formatNumber(
                trackedProducts
              )} connected commerce products are currently available for analysis.`
            : `${formatNumber(
                trackedProducts
              )} marketplace products are currently available for analysis.`
          : "Connect order and product data to improve commerce recommendations.";
            importance = "medium";
    }

    items.push({
      id: "commerce",
      label,
      detail,
      importance,
    });
  }

  return items.slice(0, 3);
}

function getSignalImportance(severity) {
  if (severity === "high") return "high";
  if (severity === "medium") return "medium";
  return "low";
}

function getHealthLabel({ score, connectionsNeedingAttention }) {
  if (connectionsNeedingAttention > 0) return "Needs attention";
  if (score >= 80) return "Strong";
  if (score >= 60) return "Stable";
  if (score >= 40) return "Developing";
  return "Limited data";
}

function getHealthTextClass(label) {
  if (label === "Strong") return "text-emerald-400";
  if (label === "Stable") return "text-blue-400";
  if (label === "Needs attention") return "text-amber-400";
  return "text-zinc-400";
}

function BriefItem({ label, detail, importance = "medium" }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-zinc-800 bg-black/20 px-4 py-3">
      <span
        className="mt-1 inline-block h-2.5 min-h-2.5 w-2.5 min-w-2.5 shrink-0 rounded-full"
        style={{
          backgroundColor: getImportanceColor(importance),
          boxShadow: `0 0 10px ${getImportanceGlow(importance)}`,
        }}
      />

      <div>
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="mt-1 text-xs leading-5 text-zinc-500">
          {detail}
        </p>
      </div>
    </div>
  );
}

function getImportanceColor(importance) {
  if (importance === "high") return "#34d399";
  if (importance === "medium") return "#60a5fa";
  return "#71717a";
}

function getImportanceGlow(importance) {
  if (importance === "high") {
    return "rgba(52, 211, 153, 0.7)";
  }

  if (importance === "medium") {
    return "rgba(96, 165, 250, 0.55)";
  }

  return "rgba(113, 113, 122, 0.35)";
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US", {
    notation: Number(value || 0) >= 10000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(Number(value || 0));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value || 0));
}