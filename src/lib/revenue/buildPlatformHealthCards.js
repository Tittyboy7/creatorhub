function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(Number(value || 0));
}

function getYouTubeAccount(connectedAccounts) {
  return connectedAccounts.find((account) => account.platform === "youtube");
}

function buildYouTubeCard({ youtubeAccount, revenue, monthlyGrowthPercent }) {
  const youtubeMetadata = youtubeAccount?.metadata?.youtube || null;

  return {
    platform: "YouTube",
    revenue,
    audience: youtubeMetadata
      ? `${formatNumber(youtubeMetadata.subscriber_count)} subscribers`
      : "Coming soon",
    orders: "Coming soon",
    productsSold: youtubeMetadata
      ? `${formatNumber(youtubeMetadata.video_count)} videos`
      : "Coming soon",
    views: youtubeMetadata
      ? `${formatNumber(youtubeMetadata.view_count)} views`
      : "Coming soon",
    growth:
      monthlyGrowthPercent >= 0
        ? `+${monthlyGrowthPercent}%`
        : `${monthlyGrowthPercent}%`,
    status: youtubeMetadata ? "YouTube synced" : "Connected",
  };
}

export function buildPlatformHealthCards({
  platformChartData,
  monthlyGrowthPercent,
  connectedAccounts = [],
}) {
  const youtubeAccount = getYouTubeAccount(connectedAccounts);

  const cards = platformChartData.map((platform) => {
    const isYouTube = platform.platform.toLowerCase() === "youtube";

    if (isYouTube) {
      return buildYouTubeCard({
        youtubeAccount,
        revenue: platform.revenue,
        monthlyGrowthPercent,
      });
    }

    return {
      platform: platform.platform,
      revenue: platform.revenue,
      audience: "Coming soon",
      orders: "Coming soon",
      productsSold: "Coming soon",
      views: "Coming soon",
      growth:
        monthlyGrowthPercent >= 0
          ? `+${monthlyGrowthPercent}%`
          : `${monthlyGrowthPercent}%`,
      status: "Manual data",
    };
  });

  const alreadyHasYouTubeCard = cards.some(
    (card) => card.platform.toLowerCase() === "youtube"
  );

  if (youtubeAccount && !alreadyHasYouTubeCard) {
    cards.unshift(
      buildYouTubeCard({
        youtubeAccount,
        revenue: 0,
        monthlyGrowthPercent,
      })
    );
  }

  return cards;
}