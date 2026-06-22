import { formatCurrency } from "@/lib/formatCurrency";

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(Number(value || 0));
}

function getConnectedAccount(connectedAccounts, platformKey) {
  return connectedAccounts.find((account) => account.platform === platformKey);
}

function formatGrowth(monthlyGrowthPercent) {
  return monthlyGrowthPercent >= 0
    ? `+${monthlyGrowthPercent}%`
    : `${monthlyGrowthPercent}%`;
}

function buildYouTubeCard({ account, revenue, monthlyGrowthPercent }) {
  const metadata = account?.metadata?.youtube || null;

  return {
    platform: "YouTube",
    revenue,
    audience: metadata
      ? `${formatNumber(metadata.subscriber_count)} subscribers`
      : "Coming soon",
    orders: "Coming soon",
    productsSold: metadata
      ? `${formatNumber(metadata.video_count)} videos`
      : "Coming soon",
    views: metadata ? `${formatNumber(metadata.view_count)} views` : "Coming soon",
    growth: formatGrowth(monthlyGrowthPercent),
    status: metadata ? "YouTube synced" : "Connected",
  };
}

function buildTwitchCard({ account, revenue, monthlyGrowthPercent }) {
  const metadata = account?.metadata?.twitch || null;

  return {
    platform: "Twitch",
    revenue,
    audience: metadata?.broadcaster_type || "Connected",
    orders: "Coming soon",
    productsSold: metadata?.profile_image_url ? "Profile connected" : "Coming soon",
    views: metadata ? `${formatNumber(metadata.view_count)} views` : "Coming soon",
    growth: formatGrowth(monthlyGrowthPercent),
    status: metadata ? "Twitch synced" : "Connected",
  };
}

function buildShopifyCard({ account, revenue, monthlyGrowthPercent }) {
  const metadata = account?.metadata?.shopify || null;

  return {
    platform: "Shopify",
    revenue: metadata?.total_order_revenue ?? revenue,
    audience: metadata
      ? `${formatNumber(metadata.orders_count)} orders`
      : "Coming soon",
    orders: metadata
      ? formatCurrency(metadata.average_order_value || 0)
      : "Coming soon",
    productsSold: metadata
      ? `${formatNumber(metadata.products_count)} products`
      : "Coming soon",
    views: metadata?.currency || "Coming soon",
    growth: formatGrowth(monthlyGrowthPercent),
    status: metadata ? "Shopify synced" : "Connected",
  };
}

function buildManualCard({ platform, monthlyGrowthPercent }) {
  return {
    platform: platform.platform,
    revenue: platform.revenue,
    audience: "Coming soon",
    orders: "Coming soon",
    productsSold: "Coming soon",
    views: "Coming soon",
    growth: formatGrowth(monthlyGrowthPercent),
    status: "Manual data",
  };
}

export function buildPlatformHealthCards({
  platformChartData,
  monthlyGrowthPercent,
  connectedAccounts = [],
}) {
  const youtubeAccount = getConnectedAccount(connectedAccounts, "youtube");
  const twitchAccount = getConnectedAccount(connectedAccounts, "twitch");
  const shopifyAccount = getConnectedAccount(connectedAccounts, "shopify");

  const cards = platformChartData.map((platform) => {
    const platformKey = platform.platform.toLowerCase();

    if (platformKey === "youtube") {
      return buildYouTubeCard({
        account: youtubeAccount,
        revenue: platform.revenue,
        monthlyGrowthPercent,
      });
    }

    if (platformKey === "twitch") {
      return buildTwitchCard({
        account: twitchAccount,
        revenue: platform.revenue,
        monthlyGrowthPercent,
      });
    }

    if (platformKey === "shopify") {
      return buildShopifyCard({
        account: shopifyAccount,
        revenue: platform.revenue,
        monthlyGrowthPercent,
      });
    }

    return buildManualCard({
      platform,
      monthlyGrowthPercent,
    });
  });

  const alreadyHasYouTubeCard = cards.some(
    (card) => card.platform.toLowerCase() === "youtube"
  );

  const alreadyHasTwitchCard = cards.some(
    (card) => card.platform.toLowerCase() === "twitch"
  );

  const alreadyHasShopifyCard = cards.some(
    (card) => card.platform.toLowerCase() === "shopify"
  );

  if (youtubeAccount && !alreadyHasYouTubeCard) {
    cards.unshift(
      buildYouTubeCard({
        account: youtubeAccount,
        revenue: 0,
        monthlyGrowthPercent,
      })
    );
  }

  if (twitchAccount && !alreadyHasTwitchCard) {
    cards.unshift(
      buildTwitchCard({
        account: twitchAccount,
        revenue: 0,
        monthlyGrowthPercent,
      })
    );
  }

  if (shopifyAccount && !alreadyHasShopifyCard) {
    cards.unshift(
      buildShopifyCard({
        account: shopifyAccount,
        revenue: 0,
        monthlyGrowthPercent,
      })
    );
  }

  return cards;
}