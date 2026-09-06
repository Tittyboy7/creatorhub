import PlatformHero from "@/components/platforms/PlatformHero";
import PlatformSummaryBar from "@/components/platforms/PlatformSummaryBar";
import PlatformGrid from "@/components/platforms/PlatformGrid";
import RecommendedConnections from "@/components/platforms/RecommendedConnections";
import buildPlatformHubData from "@/lib/simulation/hub/buildPlatformHubData";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  platformHubMockData,
  recommendedConnections,
} from "@/components/platforms/platformHubMockData";

export default async function PlatformsPage() {

  const supabase =
    await createSupabaseServerClient();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();

  let metricPreferences = {};

  if (user) {
    const {
      data: preferenceData,
    } =
      await supabase
        .from(
          "creator_preferences"
        )
        .select(
          "platform_hub"
        )
        .eq(
          "user_id",
          user.id
        )
        .maybeSingle();

    metricPreferences =
      preferenceData
        ?.platform_hub
        ?.metricSelections ||
      {};
  }

  const platforms =
    buildPlatformHubData({
      platforms: platformHubMockData,
    });

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-6 text-white sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1480px] space-y-6">
        <PlatformHero />

        <PlatformSummaryBar platforms={platforms} />

        <PlatformGrid
          platforms={platforms}
          metricPreferences={
            metricPreferences
          }
        />

        <RecommendedConnections recommendations={recommendedConnections} />
      </div>
    </div>
  );
}