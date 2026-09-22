import {
  getAvailablePlatforms,
} from "@/lib/platforms";

const DOMAIN_WEIGHTS = {
  revenue: 1,
  audience: 2,
  content: 2,
  community: 3,
  commerce: 3,
  sponsorships: 4,
};

const CATEGORY_DEPTH_WEIGHTS = {
  Memberships: 3,
  Payments: 2,
  Donations: 2,
  Commerce: 1,
  Streaming: 0,
  Video: 0,
};

function getConnectedDomains(
  connectedPlatforms = []
) {
  return new Set(
    connectedPlatforms.flatMap(
      (platform) =>
        platform.domains || []
    )
  );
}

function getPlatformScore({
  platform,
  connectedDomains,
}) {
  const domains =
    platform.domains || [];

  const newDomains =
    domains.filter(
      (domain) =>
        !connectedDomains.has(
          domain
        )
    );

  const domainScore =
    newDomains.reduce(
      (total, domain) =>
        total +
        (DOMAIN_WEIGHTS[
          domain
        ] || 1),
      0
    );

  const depthScore =
    CATEGORY_DEPTH_WEIGHTS[
      platform.category
    ] || 0;

  const score =
    domainScore +
    depthScore;

  return {
    score,
    newDomains,
    depthScore,
  };
}

function getRecommendationReason({
  platform,
  newDomains,
  depthScore,
}) {
  if (
    newDomains.includes(
      "sponsorships"
    )
  ) {
    return "Add sponsorship income to your business picture.";
  }

  if (
    newDomains.includes(
      "community"
    )
  ) {
    return "Add community and supporter activity to your business picture.";
  }

  if (
    newDomains.includes(
      "commerce"
    )
  ) {
    return "Add more commerce and transaction visibility.";
  }

  if (
    newDomains.includes(
      "audience"
    )
  ) {
    return "Add another source of audience and growth signals.";
  }

  if (
    newDomains.includes(
      "content"
    )
  ) {
    return "Add another source of content performance signals.";
  }

  if (
    depthScore > 0 &&
    platform.category ===
      "Memberships"
  ) {
    return "Add recurring supporter income and membership activity to deepen your business picture.";
  }

  if (
    depthScore > 0 &&
    platform.category ===
      "Payments"
  ) {
    return "Add another payment source to strengthen revenue visibility.";
  }

  if (
    depthScore > 0 &&
    platform.category ===
      "Donations"
  ) {
    return "Add direct supporter contributions to deepen revenue and community visibility.";
  }

  if (
    platform.domains?.includes(
      "revenue"
    )
  ) {
    return "Add another revenue source for a more complete business view.";
  }

  return "Connect this platform to expand your CreatorsHub workspace.";
}

export default function buildPlatformRecommendations({
  connectedPlatformKeys = [],
  limit = 3,
} = {}) {
  const connectedKeySet =
    new Set(
      connectedPlatformKeys
    );

  const isFirstConnection =
    connectedKeySet.size === 0;

  const availablePlatforms =
    getAvailablePlatforms();

  const connectedPlatforms =
    availablePlatforms.filter(
      (platform) =>
        connectedKeySet.has(
          platform.key
        )
    );

  const connectedDomains =
    getConnectedDomains(
      connectedPlatforms
    );

  return availablePlatforms
    .filter(
      (platform) =>
        !connectedKeySet.has(
          platform.key
        )
    )
    .map((platform) => {
      const {
        score,
        newDomains,
        depthScore,
      } =
        getPlatformScore({
          platform,
          connectedDomains,
        });

      const firstConnectionBonus =
        isFirstConnection
          ? platform.key === "youtube"
            ? 6
            : platform.key === "shopify"
              ? 5
              : platform.key === "twitch"
                ? 4
                : 0
          : 0;

      const finalScore =
        score +
        firstConnectionBonus;

      return {
        ...platform,

        recommendationScore:
          finalScore,

        recommendationDomains:
          newDomains,

        recommendationDepthScore:
          depthScore,

        recommendationReason:
          isFirstConnection
            ? platform.key === "youtube"
              ? "Start with content, audience, and revenue signals from your YouTube business."
              : platform.key === "shopify"
                ? "Start with store sales, products, orders, and commerce revenue."
                : platform.key === "twitch"
                  ? "Start with streaming, audience, community, and revenue signals."
                  : getRecommendationReason({
                      platform,
                      newDomains,
                      depthScore,
                    })
            : getRecommendationReason({
                platform,
                newDomains,
                depthScore,
              }),
      };
    })
    .sort(
      (a, b) =>
        b.recommendationScore -
        a.recommendationScore
    )
    .slice(
      0,
      limit
    );
}