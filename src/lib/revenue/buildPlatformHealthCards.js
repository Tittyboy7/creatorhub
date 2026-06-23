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

function buildKickCard({ account, revenue, monthlyGrowthPercent }) {
  const metadata = account?.metadata?.kick || null;

  return {
    platform: "Kick",
    revenue,
    audience:
      metadata?.email || metadata?.username || metadata?.name
        ? "Account connected"
        : "Connected",
    orders: "Coming soon",
    productsSold:
      metadata?.profile_picture || metadata?.profile_pic
        ? "Profile connected"
        : "Coming soon",
    views: "Coming soon",
    growth: formatGrowth(monthlyGrowthPercent),
    status: metadata ? "Kick synced" : "Connected",
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

function buildPatreonCard({ account, revenue, monthlyGrowthPercent }) {
  const metadata = account?.metadata?.patreon || null;

  return {
    platform: "Patreon",
    revenue,
    audience: metadata
      ? `${formatNumber(metadata.patron_count)} patrons`
      : "Coming soon",
    orders: "Coming soon",
    productsSold: metadata?.campaign_name || metadata?.creation_name || "Coming soon",
    views: metadata?.url ? "Campaign connected" : "Coming soon",
    growth: formatGrowth(monthlyGrowthPercent),
    status: metadata ? "Patreon synced" : "Connected",
  };
}

function buildStripeCard({ account, revenue, monthlyGrowthPercent }) {
  const metadata = account?.metadata?.stripe || null;

  return {
    platform: "Stripe",
    revenue: metadata?.net_revenue ?? revenue,
    audience: metadata
      ? `${formatNumber(metadata.customers_count)} customers`
      : "Coming soon",
    orders: metadata
      ? `${formatNumber(metadata.successful_payments_count)} payments`
      : "Coming soon",
    productsSold: metadata
      ? `${formatNumber(metadata.charges_count)} charges`
      : "Coming soon",
    views: metadata?.default_currency
      ? metadata.default_currency.toUpperCase()
      : "Coming soon",
    growth: formatGrowth(monthlyGrowthPercent),
    status: metadata ? "Stripe synced" : "Connected",
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
  const kickAccount = getConnectedAccount(connectedAccounts, "kick");
  const shopifyAccount = getConnectedAccount(connectedAccounts, "shopify");
  const patreonAccount = getConnectedAccount(connectedAccounts, "patreon");
  const stripeAccount = getConnectedAccount(connectedAccounts, "stripe");

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

    if (platformKey === "kick") {
      return buildKickCard({
        account: kickAccount,
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

    if (platformKey === "patreon") {
      return buildPatreonCard({
        account: patreonAccount,
        revenue: platform.revenue,
        monthlyGrowthPercent,
      });
    }

    if (platformKey === "stripe") {
      return buildStripeCard({
        account: stripeAccount,
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

  const alreadyHasKickCard = cards.some(
    (card) => card.platform.toLowerCase() === "kick"
  );

  const alreadyHasShopifyCard = cards.some(
    (card) => card.platform.toLowerCase() === "shopify"
  );

  const alreadyHasPatreonCard = cards.some(
    (card) => card.platform.toLowerCase() === "patreon"
  );

  const alreadyHasStripeCard = cards.some(
    (card) => card.platform.toLowerCase() === "stripe"
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

  if (kickAccount && !alreadyHasKickCard) {
    cards.unshift(
      buildKickCard({
        account: kickAccount,
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

  if (patreonAccount && !alreadyHasPatreonCard) {
    cards.unshift(
      buildPatreonCard({
        account: patreonAccount,
        revenue: 0,
        monthlyGrowthPercent,
      })
    );
  }

  if (stripeAccount && !alreadyHasStripeCard) {
    cards.unshift(
      buildStripeCard({
        account: stripeAccount,
        revenue: 0,
        monthlyGrowthPercent,
      })
    );
  }

  return cards;
}