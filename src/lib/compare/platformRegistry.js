export const platformRegistry = [
  "YouTube",
  "Twitch",
  "Kick",
  "Shopify",
  "Patreon",
  "Stripe",
  "PayPal",
  "Streamlabs",
  "StreamElements",
  "Products",
  "Sponsorship",
];

export function normalizePlatformName(platform = "") {
  const normalized = platform.toLowerCase().trim();

  return (
    platformRegistry.find(
      (registryPlatform) =>
        registryPlatform.toLowerCase() === normalized
    ) || platform
  );
}

export function getCanonicalPlatforms(platforms = []) {
  return [
    ...new Set(
      platforms
        .filter(Boolean)
        .map((platform) => normalizePlatformName(platform))
    ),
  ];
}