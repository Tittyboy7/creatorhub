export function buildBusinessMetrics({
  revenueEntries = [],
  connectedAccounts = [],
  products = [],
} = {}) {
  const metrics = [];

  revenueEntries.forEach((entry) => {
    metrics.push({
      id: `revenue-${entry.id}`,
      source: entry.platform || "unknown",
      category: "revenue",
      metric: "revenue",
      label: `${entry.platform} Revenue`,
      value: Number(entry.amount || 0),
      unit: "currency",
      period: entry.entry_month || null,
      date: entry.created_at || null,
      metadata: {
        revenueType: entry.revenue_type,
        entryId: entry.id,
        syncedFromApi: Boolean(entry.synced_from_api),
      },
    });
  });

  connectedAccounts.forEach((account) => {
    metrics.push({
      id: `connection-${account.id}`,
      source: account.platform || "unknown",
      category: "integration",
      metric: "connection_status",
      label: `${account.platform} Connection`,
      value: account.sync_error ? 0 : 1,
      unit: "status",
      period: null,
      date: account.last_synced_at || account.created_at || null,
      metadata: {
        accountId: account.id,
        syncStatus: account.sync_status,
        syncError: account.sync_error,
      },
    });
  });

  products.forEach((product) => {
    metrics.push({
      id: `product-views-${product.id}`,
      source: "storefront",
      category: "product",
      metric: "views",
      label: `${product.title} Views`,
      value: Number(product.views || 0),
      unit: "count",
      period: null,
      date: product.created_at || null,
      metadata: {
        productId: product.id,
        title: product.title,
      },
    });

    metrics.push({
      id: `product-checkout-clicks-${product.id}`,
      source: "storefront",
      category: "product",
      metric: "checkout_clicks",
      label: `${product.title} Checkout Clicks`,
      value: Number(product.checkout_clicks || 0),
      unit: "count",
      period: null,
      date: product.created_at || null,
      metadata: {
        productId: product.id,
        title: product.title,
      },
    });
  });

  return metrics;
}