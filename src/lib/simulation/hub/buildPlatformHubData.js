import gamingStreamer from "@/lib/simulation/creators/gamingStreamer";
import buildDailySimulationSnapshot from "@/lib/simulation/daily/buildDailySimulationSnapshot";
import buildLegacySimulationBridge from "@/lib/simulation/daily/buildLegacySimulationBridge";
import buildYouTubePlatformData from "@/lib/simulation/adapters/youtube/buildPlatformData";
import buildYouTubePlatformHubCard from "@/lib/simulation/adapters/youtube/buildPlatformHubCard";
import buildTwitchPlatformHubCard from "@/lib/simulation/adapters/twitch/buildPlatformHubCard";
import buildShopifyPlatformHubCard from "@/lib/simulation/adapters/shopify/buildPlatformHubCard";
import buildPlatformHealth from "@/lib/simulation/hub/buildPlatformHealth";

export default function buildPlatformHubData({
  platforms = [],
} = {}) {
  const dailySimulation =
    buildDailySimulationSnapshot(
      gamingStreamer
    );

  const simulation =
    buildLegacySimulationBridge(
      dailySimulation
    );

  const youtubePlatformData =
    buildYouTubePlatformData({
      creator: gamingStreamer,
      simulation,
    });

  const youtubeHubData =
    buildYouTubePlatformHubCard({
      platformData:
        youtubePlatformData,
    });

  const twitchHubData =
    buildTwitchPlatformHubCard({
      dailySimulation,
      creator: gamingStreamer,
    });

  const shopifyHubData =
    buildShopifyPlatformHubCard({
      dailySimulation,
    });

  const youtubeHealth =
    buildPlatformHealth({
      platformKey: "youtube",
      dailySimulation,
    });

  const twitchHealth =
    buildPlatformHealth({
      platformKey: "twitch",
      dailySimulation,
    });

  const shopifyHealth =
    buildPlatformHealth({
      platformKey: "shopify",
      dailySimulation,
    });

  return platforms.map((platform) => {
    if (
      platform.key === "youtube" &&
      youtubeHubData
    ) {
      return {
        ...platform,

        accountName:
          youtubePlatformData
            ?.accountHandle ||
          youtubePlatformData
            ?.accountName ||
          platform.accountName,

        todayStats:
          youtubeHubData.todayStats,

        overallStats:
          youtubeHubData.overallStats,

        trendHistory:
          youtubeHubData.trendHistory,

        dataSource:
          "daily-simulation",

        summaryRevenue:
          youtubeHubData.summaryRevenue,

        status:
          youtubeHealth.status,

        attentionReason:
          youtubeHealth.attentionReason,

        healthSignals:
          youtubeHealth.signals,
      };
    }

    if (
      platform.key === "twitch" &&
      twitchHubData
    ) {
      return {
        ...platform,

        accountName:
          gamingStreamer
            ?.platforms
            ?.twitch
            ?.accountName ||
          platform.accountName,

        todayStats:
          twitchHubData.todayStats,

        overallStats:
          twitchHubData.overallStats,

        trendHistory:
          twitchHubData.trendHistory,

        summaryLabel:
          twitchHubData.summaryLabel,

        streamedToday:
          twitchHubData.streamedToday,

        dataSource:
          "daily-simulation",

        summaryRevenue:
          twitchHubData.summaryRevenue,

        status:
          twitchHealth.status,

        attentionReason:
          twitchHealth.attentionReason,

        healthSignals:
          twitchHealth.signals,
      };
    }

    if (
      platform.key === "shopify" &&
      shopifyHubData
    ) {
      return {
        ...platform,

        accountName:
          gamingStreamer
            ?.platforms
            ?.shopify
            ?.storeName ||
          platform.accountName,

        todayStats:
          shopifyHubData.todayStats,

        overallStats:
          shopifyHubData.overallStats,

        trendHistory:
          shopifyHubData.trendHistory,

        summaryLabel:
          shopifyHubData.summaryLabel,

        dataSource:
          "daily-simulation",

        summaryRevenue:
          shopifyHubData.summaryRevenue,

        status:
          shopifyHealth.status,

        attentionReason:
          shopifyHealth.attentionReason,

        healthSignals:
          shopifyHealth.signals,  
      };
    }

    return platform;
  });
}