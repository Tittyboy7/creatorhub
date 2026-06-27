export const businessMetricsCatalog = [
  {
    platform: "YouTube",
    system: "Audience",
    metrics: [
      { key: "estimated_revenue", label: "Estimated Revenue", unit: "currency", priority: "high" },
      { key: "subscribers", label: "Subscribers", unit: "count", priority: "high" },
      { key: "views", label: "Views", unit: "count", priority: "high" },
      { key: "videos", label: "Videos", unit: "count", priority: "medium" },
      { key: "watch_time", label: "Watch Time", unit: "hours", priority: "high" },
      { key: "impressions", label: "Impressions", unit: "count", priority: "medium" },
      { key: "ctr", label: "Click-through Rate", unit: "percent", priority: "medium" },
      { key: "rpm", label: "RPM", unit: "currency", priority: "high" },
    ],
  },
  {
    platform: "Twitch",
    system: "Audience",
    metrics: [
      { key: "followers", label: "Followers", unit: "count", priority: "high" },
      { key: "views", label: "Views", unit: "count", priority: "medium" },
      { key: "average_viewers", label: "Average Viewers", unit: "count", priority: "high" },
      { key: "subs", label: "Subscriptions", unit: "count", priority: "high" },
      { key: "stream_hours", label: "Stream Hours", unit: "hours", priority: "medium" },
    ],
  },
  {
    platform: "Shopify",
    system: "Commerce",
    metrics: [
      { key: "total_order_revenue", label: "Store Revenue", unit: "currency", priority: "high" },
      { key: "orders", label: "Orders", unit: "count", priority: "high" },
      { key: "products", label: "Products", unit: "count", priority: "medium" },
      { key: "average_order_value", label: "Average Order Value", unit: "currency", priority: "high" },
      { key: "inventory", label: "Inventory", unit: "count", priority: "medium" },
    ],
  },
  {
    platform: "Patreon",
    system: "Membership",
    metrics: [
      { key: "patrons", label: "Patrons", unit: "count", priority: "high" },
      { key: "monthly_revenue", label: "Monthly Revenue", unit: "currency", priority: "high" },
      { key: "new_members", label: "New Members", unit: "count", priority: "medium" },
      { key: "churn", label: "Churn", unit: "percent", priority: "medium" },
    ],
  },
  {
    platform: "Stripe",
    system: "Payments",
    metrics: [
      { key: "gross_revenue", label: "Gross Revenue", unit: "currency", priority: "high" },
      { key: "net_revenue", label: "Net Revenue", unit: "currency", priority: "high" },
      { key: "refunds", label: "Refunds", unit: "currency", priority: "medium" },
      { key: "customers", label: "Customers", unit: "count", priority: "medium" },
      { key: "successful_payments", label: "Successful Payments", unit: "count", priority: "high" },
    ],
  },
];