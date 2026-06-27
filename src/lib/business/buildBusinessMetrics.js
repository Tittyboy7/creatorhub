function pushMetric(metrics, metric) {
  if (metric.value === null || metric.value === undefined) return;

  metrics.push({
    period: null,
    date: null,
    metadata: {},
    ...metric,
    value: Number(metric.value || 0),
  });
}

export function buildBusinessMetrics({
  revenueEntries = [],
  connectedAccounts = [],
  products = [],
} = {}) {
  const metrics = [];

  revenueEntries.forEach((entry) => {
    pushMetric(metrics, {
      id: `revenue-${entry.id}`,
      source: entry.platform || "unknown",
      category: "revenue",
      metric: "revenue",
      label: `${entry.platform} Revenue`,
      value: entry.amount,
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
    const platform = account.platform || "unknown";
    const labelPlatform =
      platform.charAt(0).toUpperCase() + platform.slice(1);

    pushMetric(metrics, {
      id: `connection-${account.id}`,
      source: platform,
      category: "integration",
      metric: "connection_status",
      label: `${labelPlatform} Connection`,
      value: account.sync_error ? 0 : 1,
      unit: "status",
      date: account.last_synced_at || account.created_at || null,
      metadata: {
        accountId: account.id,
        syncStatus: account.sync_status,
        syncError: account.sync_error,
      },
    });

    const metadata = account.metadata || {};

    if (metadata.youtube) {
      pushMetric(metrics, {
        id: `youtube-subscribers-${account.id}`,
        source: "YouTube",
        category: "audience",
        metric: "subscribers",
        label: "YouTube Subscribers",
        value: metadata.youtube.subscriber_count,
        unit: "count",
        date: account.last_synced_at,
      });

      pushMetric(metrics, {
        id: `youtube-views-${account.id}`,
        source: "YouTube",
        category: "audience",
        metric: "views",
        label: "YouTube Views",
        value: metadata.youtube.view_count,
        unit: "count",
        date: account.last_synced_at,
      });

      pushMetric(metrics, {
        id: `youtube-videos-${account.id}`,
        source: "YouTube",
        category: "audience",
        metric: "videos",
        label: "YouTube Videos",
        value: metadata.youtube.video_count,
        unit: "count",
        date: account.last_synced_at,
      });
    }

    if (metadata.twitch) {
      pushMetric(metrics, {
        id: `twitch-views-${account.id}`,
        source: "Twitch",
        category: "audience",
        metric: "views",
        label: "Twitch Views",
        value: metadata.twitch.view_count,
        unit: "count",
        date: account.last_synced_at,
      });
    }

    if (metadata.shopify) {
      pushMetric(metrics, {
        id: `shopify-revenue-${account.id}`,
        source: "Shopify",
        category: "commerce",
        metric: "revenue",
        label: "Shopify Store Revenue",
        value: metadata.shopify.total_order_revenue,
        unit: "currency",
        date: account.last_synced_at,
      });

      pushMetric(metrics, {
        id: `shopify-orders-${account.id}`,
        source: "Shopify",
        category: "commerce",
        metric: "orders",
        label: "Shopify Orders",
        value: metadata.shopify.orders_count,
        unit: "count",
        date: account.last_synced_at,
      });

      pushMetric(metrics, {
        id: `shopify-products-${account.id}`,
        source: "Shopify",
        category: "commerce",
        metric: "products",
        label: "Shopify Products",
        value: metadata.shopify.products_count,
        unit: "count",
        date: account.last_synced_at,
      });

      pushMetric(metrics, {
        id: `shopify-aov-${account.id}`,
        source: "Shopify",
        category: "commerce",
        metric: "average_order_value",
        label: "Shopify Average Order Value",
        value: metadata.shopify.average_order_value,
        unit: "currency",
        date: account.last_synced_at,
      });
    }

    if (metadata.patreon) {
      pushMetric(metrics, {
        id: `patreon-patrons-${account.id}`,
        source: "Patreon",
        category: "membership",
        metric: "patrons",
        label: "Patreon Patrons",
        value: metadata.patreon.patron_count,
        unit: "count",
        date: account.last_synced_at,
      });
    }

    if (metadata.stripe) {
      pushMetric(metrics, {
        id: `stripe-gross-revenue-${account.id}`,
        source: "Stripe",
        category: "payments",
        metric: "gross_revenue",
        label: "Stripe Gross Revenue",
        value: metadata.stripe.gross_revenue,
        unit: "currency",
        date: account.last_synced_at,
      });

      pushMetric(metrics, {
        id: `stripe-net-revenue-${account.id}`,
        source: "Stripe",
        category: "payments",
        metric: "net_revenue",
        label: "Stripe Net Revenue",
        value: metadata.stripe.net_revenue,
        unit: "currency",
        date: account.last_synced_at,
      });

      pushMetric(metrics, {
        id: `stripe-refunds-${account.id}`,
        source: "Stripe",
        category: "payments",
        metric: "refunds",
        label: "Stripe Refunds",
        value: metadata.stripe.refunded_amount,
        unit: "currency",
        date: account.last_synced_at,
      });

      pushMetric(metrics, {
        id: `stripe-payments-${account.id}`,
        source: "Stripe",
        category: "payments",
        metric: "successful_payments",
        label: "Stripe Successful Payments",
        value: metadata.stripe.successful_payments_count,
        unit: "count",
        date: account.last_synced_at,
      });

      pushMetric(metrics, {
        id: `stripe-customers-${account.id}`,
        source: "Stripe",
        category: "payments",
        metric: "customers",
        label: "Stripe Customers",
        value: metadata.stripe.customers_count,
        unit: "count",
        date: account.last_synced_at,
      });
    }

    if (metadata.paypal) {
      pushMetric(metrics, {
        id: `paypal-connected-${account.id}`,
        source: "PayPal",
        category: "payments",
        metric: "connection_status",
        label: "PayPal Connected",
        value: metadata.paypal.connected ? 1 : 0,
        unit: "status",
        date: metadata.paypal.last_checked_at || account.last_synced_at,
      });
    }
  });

  products.forEach((product) => {
    pushMetric(metrics, {
      id: `product-views-${product.id}`,
      source: "storefront",
      category: "product",
      metric: "views",
      label: `${product.title} Views`,
      value: product.views,
      unit: "count",
      date: product.created_at || null,
      metadata: {
        productId: product.id,
        title: product.title,
      },
    });

    pushMetric(metrics, {
      id: `product-checkout-clicks-${product.id}`,
      source: "storefront",
      category: "product",
      metric: "checkout_clicks",
      label: `${product.title} Checkout Clicks`,
      value: product.checkout_clicks,
      unit: "count",
      date: product.created_at || null,
      metadata: {
        productId: product.id,
        title: product.title,
      },
    });
  });

  return metrics;
}