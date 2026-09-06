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
import buildBusinessSignals from "@/lib/simulation/engine/buildBusinessSignals";
import buildYouTubeRevenue from "@/lib/simulation/adapters/youtube/buildRevenue";
import buildYouTubeAudience from "@/lib/simulation/adapters/youtube/buildAudience";
import buildYouTubeContentPerformance from "@/lib/simulation/adapters/youtube/buildContentPerformance";

import {
  youtubePlatformDetail,
  youtubePlatformToday,
  youtubeRecommendedNextAction,
} from "@/components/platforms/detail/PlatformDetailMockData";

export default function YouTubePlatformPage() {
  const useSimulation =
    process.env
      .CREATORSHUB_USE_SIMULATION ===
    "true";

  const youtubeConfig = getPlatform("youtube");

  if (!useSimulation) {
    return (
      <div className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div
            className="
              rounded-3xl
              border
              border-zinc-800
              bg-zinc-900/70
              p-8
              text-center
              shadow-[0_20px_60px_rgba(0,0,0,0.2)]
            "
          >
            <div
              className="
                mx-auto
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                border
                border-red-500/30
                bg-red-500/10
                text-red-300
              "
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6"
              >
                <path
                  d="M10 8.5 15 12l-5 3.5v-7Z"
                  fill="currentColor"
                />

                <rect
                  x="3.5"
                  y="6"
                  width="17"
                  height="12"
                  rx="4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
              </svg>
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              YouTube Workspace
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Connect YouTube to open this workspace
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              Your YouTube performance, audience, content, retention,
              and revenue insights will appear here once your account
              is connected.
            </p>

            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="/connected-accounts/youtube"
                className="
                  inline-flex
                  min-h-11
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/80
                  bg-white
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-zinc-950
                  transition
                  hover:bg-zinc-200
                "
              >
                Connect YouTube
              </a>

              <a
                href="/platforms"
                className="
                  inline-flex
                  min-h-11
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-zinc-800
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-zinc-300
                  transition
                  hover:border-zinc-700
                  hover:bg-zinc-900
                  hover:text-white
                "
              >
                Back to Platform Hub
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            youtube:
              youtubePlatformData,
          },
        }
      : gamingStreamer;

  const signals =
    buildBusinessSignals(
      simulatedCreator
    );

  const youtubeContentPerformance =
    buildYouTubeContentPerformance({
      creator:
        simulatedCreator,
      signals,
    });

  const youtubeRevenue =
    buildYouTubeRevenue({
      creator:
        simulatedCreator,
      signals,
    });

  const youtubeAudience =
    buildYouTubeAudience({
      creator:
        simulatedCreator,
      signals,
    });

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

      <PlatformContentSection
        sections={
          youtubeAnalyticsSections
        }
        chapterData={{
          contentPerformance:
            youtubeContentPerformance,

          revenue:
            youtubeRevenue,

          audience:
            youtubeAudience,
        }}
      />

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