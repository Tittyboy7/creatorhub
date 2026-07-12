export const platformHubMockData = [
  {
    name: "YouTube",
    key: "youtube",
    logo: "youtube",
    type: "Video",
    status: "healthy",
    accountName: "@creatorchannel",
    lastSynced: "2 min ago",
    todayStats: [
      { label: "Views", value: "31.4K", trend: "+12%" },
      { label: "Subscribers", value: "+412", trend: "+8%" },
      { label: "Revenue", value: "$148", trend: "+15%" },
      { label: "Watch Time", value: "940h", trend: "+14%" },
    ],
    overallStats: [
      { label: "Views", value: "6.42M" },
      { label: "Subscribers", value: "82.4K" },
      { label: "Revenue", value: "$84.2K" },
    ],
  },
  {
    name: "Shopify",
    key: "shopify",
    logo: "shopify",
    type: "Commerce",
    status: "healthy",
    accountName: "Creator Store",
    lastSynced: "8 min ago",
    todayStats: [
      { label: "Orders", value: "18", trend: "+5%" },
      { label: "Sales", value: "$924", trend: "+22%" },
      { label: "Products Sold", value: "4", trend: "+14%" },
      { label: "Conversion", value: "3.8%", trend: "+0.4%" },
    ],
    overallStats: [
      { label: "Orders", value: "1,482" },
      { label: "Revenue", value: "$73.1K" },
      { label: "Customers", value: "921" },
      { label: "Watch Time", value: "820h", trend: "-3%" },
    ],
  },
  {
    name: "Twitch",
    key: "twitch",
    logo: "twitch",
    type: "Streaming",
    status: "attention",
    accountName: "creator_live",
    lastSynced: "1 day ago",
    todayStats: [
      { label: "Subs", value: "13", trend: "-7%" },
      { label: "Tips", value: "$76", trend: "-11%" },
      { label: "Followers", value: "+4", trend: "+2%" },
      { label: "Watch Time", value: "820h", trend: "-3%" },
    ],
    overallStats: [
      { label: "Followers", value: "21.8K" },
      { label: "Subs", value: "5.1K" },
      { label: "Revenue", value: "$35K" },
    ],
  },
];

export const recommendedConnections = [
  {
    name: "Patreon",
    key: "patreon",
    description: "Sync memberships, patrons, and recurring income.",
  },
  {
    name: "Stripe",
    key: "stripe",
    description: "Track payments, subscriptions, payouts, and net revenue.",
  },
  {
    name: "PayPal",
    key: "paypal",
    description: "Sync payments, refunds, and creator income.",
  },
];