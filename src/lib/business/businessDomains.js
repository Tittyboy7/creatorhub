export const businessDomains = [
  {
    key: "revenue",
    label: "Revenue",
    description: "How the creator earns money.",
  },
  {
    key: "audience",
    label: "Audience",
    description: "How people discover, follow, and engage with the creator.",
  },
  {
    key: "commerce",
    label: "Commerce",
    description: "How products, orders, and customers perform.",
  },
  {
    key: "content",
    label: "Content",
    description: "How publishing and streaming activity performs.",
  },
  {
    key: "community",
    label: "Community",
    description: "How recurring supporters and members behave.",
  },
  {
    key: "sponsorships",
    label: "Sponsorships",
    description: "How brand partnerships and campaigns perform.",
  },
];

export const metricDomainMap = {
  estimated_revenue: "revenue",
  revenue: "revenue",
  gross_revenue: "revenue",
  net_revenue: "revenue",
  refunds: "revenue",
  monthly_revenue: "revenue",

  subscribers: "audience",
  followers: "audience",
  views: "audience",
  average_viewers: "audience",
  watch_time: "audience",
  impressions: "audience",
  ctr: "audience",

  orders: "commerce",
  products: "commerce",
  average_order_value: "commerce",
  inventory: "commerce",
  customers: "commerce",
  successful_payments: "commerce",

  videos: "content",
  stream_hours: "content",

  patrons: "community",
  subs: "community",
  new_members: "community",
  churn: "community",

  sponsor_revenue: "sponsorships",
  campaigns: "sponsorships",
  renewal_rate: "sponsorships",
};

export function getBusinessDomainForMetric(metricKey) {
  return metricDomainMap[metricKey] || null;
}