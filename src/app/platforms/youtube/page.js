import PlatformDetailHeader from "@/components/platforms/detail/PlatformDetailHeader";
import PlatformDetailSidebar from "@/components/platforms/detail/PlatformDetailSidebar";
import PlatformSnapshotCard from "@/components/platforms/detail/PlatformSnapshotCard";
import PlatformContentSection from "@/components/platforms/detail/PlatformContentSection";
import RecommendedNextAction from "@/components/platforms/detail/design-system/action/RecommendedNextAction";
import WorkspaceLayout from "@/components/workspace/WorkspaceLayout";

import { getPlatform } from "@/lib/platforms";

import {
  youtubePlatformDetail,
  youtubePlatformToday,
  youtubeRecommendedNextAction,
} from "@/components/platforms/detail/PlatformDetailMockData";

export default function YouTubePlatformPage() {
  const youtubeConfig = getPlatform("youtube");

  const sectionItemsByKey = {
    content: youtubePlatformDetail.contentPerformance,
    reach: youtubePlatformDetail.reachMetrics,
    engagement: youtubePlatformDetail.engagementMetrics,
    audience: youtubePlatformDetail.audienceMetrics,
    traffic: youtubePlatformDetail.trafficSourceMetrics,
    retention: youtubePlatformDetail.retentionMetrics,
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
      variant: sectionVariantsByKey[section.key] || "metrics",
      items: sectionItemsByKey[section.key] || [],
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
      workspaceHeader={
        <PlatformDetailHeader
          platform={youtubePlatformDetail}
          showModeToggle
        />
      }
      sidebar={sidebar}
    >
      <PlatformSnapshotCard
        snapshot={youtubePlatformToday.snapshot}
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