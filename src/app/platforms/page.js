import PlatformHero from "@/components/platforms/PlatformHero";
import PlatformSummaryBar from "@/components/platforms/PlatformSummaryBar";
import PlatformGrid from "@/components/platforms/PlatformGrid";
import RecommendedConnections from "@/components/platforms/RecommendedConnections";

import {
  platformHubMockData,
  recommendedConnections,
} from "@/components/platforms/platformHubMockData";

export default function PlatformsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 px-5 py-6 text-white md:px-10 md:py-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <PlatformHero />

        <PlatformSummaryBar platforms={platformHubMockData} />

        <PlatformGrid platforms={platformHubMockData} />

        <RecommendedConnections recommendations={recommendedConnections} />
      </div>
    </div>
  );
}