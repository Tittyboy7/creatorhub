export default function createAsset({
  id,
  platform,
  assetType,

  title,

  publishedAt,

  status = "published",

  currentPeriod = {},

  previousPeriod = {},

  businessContext = {},

  platformData = {},
}) {
  return {
    id,
    platform,
    assetType,

    title,

    publishedAt,

    status,

    currentPeriod,

    previousPeriod,

    businessContext,

    platformData,
  };
}