import PlatformDetailHeader from "@/components/platforms/detail/PlatformDetailHeader";
import PlatformTodaySection from "@/components/platforms/detail/PlatformTodaySection";
import PlatformReasonsSection from "@/components/platforms/detail/PlatformReasonsSection";
import PlatformContentSection from "@/components/platforms/detail/PlatformContentSection";

import {
  youtubePlatformDetail,
  youtubePlatformBrief,
} from "@/components/platforms/detail/PlatformDetailMockData";

export default function YouTubePlatformPage() {
  return (
    <div className="min-h-screen bg-zinc-950 px-5 py-6 text-white md:px-10 md:py-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <PlatformDetailHeader platform={youtubePlatformDetail} />

        <PlatformTodaySection brief={youtubePlatformBrief} />

        <PlatformReasonsSection reasons={youtubePlatformDetail.reasons} />

        <PlatformContentSection
          contentPerformance={youtubePlatformDetail.contentPerformance}
          audienceMetrics={youtubePlatformDetail.audienceMetrics}
          revenueMetrics={youtubePlatformDetail.revenueMetrics}
        />
      </div>
    </div>
  );
}