import PlatformDetailHeader from "@/components/platforms/detail/PlatformDetailHeader";
import PlatformDetailSidebar from "@/components/platforms/detail/PlatformDetailSidebar";
import PlatformSnapshotCard from "@/components/platforms/detail/PlatformSnapshotCard";
import PlatformContentSection from "@/components/platforms/detail/PlatformContentSection";
import RecommendedNextAction from "@/components/platforms/detail/design-system/action/RecommendedNextAction";
import WorkspaceLayout from "@/components/workspace/WorkspaceLayout";
import { getPlatform } from "@/lib/platforms";
import PlatformTodaySection from "@/components/platforms/detail/PlatformTodaySection";
import gamingStreamer from "@/lib/simulation/creators/gamingStreamer";
import buildSimulationSnapshot from "@/lib/simulation/buildSimulationSnapshot";
import buildYouTubePlatformData from "@/lib/simulation/adapters/youtube/buildPlatformData";
import buildYouTubeReach from "@/lib/simulation/adapters/youtube/buildReach";
import buildYouTubeEngagement from "@/lib/simulation/adapters/youtube/buildEngagement";
import buildYouTubeRetention from "@/lib/simulation/adapters/youtube/buildRetention";

import {
  youtubePlatformDetail,
  youtubePlatformToday,
  youtubeRecommendedNextAction,
} from "@/components/platforms/detail/PlatformDetailMockData";

export default function YouTubePlatformPage() {
  const youtubeConfig = getPlatform("youtube");

  const simulation =
    buildSimulationSnapshot(gamingStreamer);

  const youtubePlatformData =
    buildYouTubePlatformData({
      creator: gamingStreamer,
      simulation,
    });

  const simulatedCreator =
    youtubePlatformData
      ? {
          ...gamingStreamer,

          platforms: {
            ...gamingStreamer.platforms,
            youtube: youtubePlatformData,
          },
        }
      : gamingStreamer;

  const youtubeReach =
    buildYouTubeReach({
      creator: simulatedCreator,
    });    

  const youtubeEngagement =
    buildYouTubeEngagement({
      creator: simulatedCreator,
    });

  const youtubeRetention =
    buildYouTubeRetention({
      creator: simulatedCreator,
    });  

  const sectionItemsByKey = {
    content: youtubePlatformDetail.contentPerformance,
    reach:
      youtubeReach?.metrics ||
      youtubePlatformDetail.reachMetrics,
    engagement:
      youtubeEngagement?.metrics ||
      youtubePlatformDetail.engagementMetrics,
    audience: youtubePlatformDetail.audienceMetrics,
    traffic: youtubePlatformDetail.trafficSourceMetrics,
    retention:
      youtubeRetention?.metrics ||
      youtubePlatformDetail.retentionMetrics,
    revenue: youtubePlatformDetail.revenueMetrics,
  };

  const sectionVariantsByKey = {
    content: "content",
    audience: "audience",
    revenue: "revenue",
  };

  const youtubeAnalyticsSections = youtubeConfig.detailSections
    .map((section) => ({
      ...section,

      variant:
        sectionVariantsByKey[section.key] ||
        "metrics",

      items:
        sectionItemsByKey[section.key] || [],

      overview:
        section.key === "reach"
          ? youtubeReach?.overview || null
          : section.key === "engagement"
            ? youtubeEngagement?.overview || null
            : section.key === "retention"
              ? youtubeRetention?.overview || null
              : null,
    }))
    .filter((section) => section.items.length > 0);

  const sidebar = (
    <PlatformDetailSidebar
      platform={youtubePlatformDetail}
      platformToday={youtubePlatformToday}
    />
  );

  return (
    <WorkspaceLayout
      showHeader={false}
      showFloatingModeToggle
      workspaceHeader={
        <PlatformDetailHeader
          platform={youtubePlatformDetail}
          showModeToggle
        />
      }
      sidebar={sidebar}
    >
      <PlatformTodaySection
        platform={youtubePlatformDetail}
        platformToday={youtubePlatformToday}
        brief={youtubePlatformDetail.brief}
      />

      <PlatformSnapshotCard
        snapshot={
          youtubePlatformData?.snapshotMetrics ||
          youtubePlatformToday.snapshot
        }
        periodLabel="Last 28 days"
      />

      <PlatformContentSection sections={youtubeAnalyticsSections} />

      <RecommendedNextAction
        title={youtubeRecommendedNextAction.title}
        reason={youtubeRecommendedNextAction.reason}
        href={youtubeRecommendedNextAction.href}
        buttonLabel={youtubeRecommendedNextAction.buttonLabel}
        accent={youtubeRecommendedNextAction.accent}
      />
    </WorkspaceLayout>
  );
}