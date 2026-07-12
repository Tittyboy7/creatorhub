import { buildPlatformBrief } from "@/lib/business/buildPlatformBrief";

export const youtubePlatformDetail = {
  key: "youtube",
  name: "YouTube",
  type: "Video",
  status: "healthy",
  accountName: "@creatorchannel",
  lastSynced: "2 min ago",

  brief: {
    whatHappened: "Your newest upload is outperforming your recent average.",
    whyItMatters:
      "Views are growing faster than subscriber growth, which means more new viewers are discovering your content.",
    recommendation:
      "Publish another long-form video within the next 48 hours while momentum is elevated.",
  },

  keyMetrics: [
    { label: "Revenue Today", value: "$148", trend: "+15%" },
    { label: "Views Today", value: "31.4K", trend: "+12%" },
    { label: "Subscribers", value: "+412", trend: "+8%" },
    { label: "Watch Time", value: "940h", trend: "+14%" },
  ],

  reasons: [
    "Returning viewers increased after your latest upload.",
    "Click-through rate stayed above your recent average.",
    "Watch time improved, which may help the video continue reaching new viewers.",
  ],

  contentPerformance: [
    {
      label: "Top Recent Video",
      title: "How I Built My Creator Store",
      metric: "18.4K views today",
    },
    {
      label: "Most Improved",
      title: "Behind the Scenes: Product Launch",
      metric: "+42% watch time",
    },
    {
      label: "Needs Review",
      title: "Weekly Update #12",
      metric: "CTR below average",
    },
  ],

  audienceMetrics: [
    { label: "Returning Viewers", value: "12.8K", trend: "+18%" },
    { label: "New Viewers", value: "18.6K", trend: "+9%" },
    { label: "Subscriber Growth", value: "+412", trend: "+8%" },
  ],

  revenueMetrics: [
    { label: "Ad Revenue", value: "$96", trend: "+11%" },
    { label: "Memberships", value: "$34", trend: "+7%" },
    { label: "Supers", value: "$18", trend: "+22%" },
  ],
};

export const youtubePlatformBrief = buildPlatformBrief({
  platformName: youtubePlatformDetail.name,
  status: youtubePlatformDetail.status,
  keyMetrics: youtubePlatformDetail.keyMetrics,
  reasons: youtubePlatformDetail.reasons,
  recommendation: youtubePlatformDetail.brief.recommendation,
});