"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatMonth } from "@/lib/formatMonth";
import { usePlatformRevenueData } from "@/hooks/usePlatformRevenueData";
import { platformRoadmaps } from "@/lib/revenue/platformRoadmaps";

function formatPlatformName(value) {
  if (!value) return "Platform";

  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "Not synced yet";
  return new Date(value).toLocaleString();
}

function buildDetailCards({ platformSlug, account, revenueEntries }) {
  const youtube = account?.metadata?.youtube || null;
  const twitch = account?.metadata?.twitch || null;
  const shopify = account?.metadata?.shopify || null;

  const syncedRevenueTotal = revenueEntries.reduce(
    (sum, entry) => sum + Number(entry.amount || 0),
    0
  );

  if (platformSlug === "shopify") {
    return [
      {
        label: "Synced Revenue",
        value: formatCurrency(shopify?.total_order_revenue || 0),
      },
      {
        label: "Orders",
        value: shopify ? formatNumber(shopify.orders_count) : "Coming soon",
      },
      {
        label: "Products",
        value: shopify ? formatNumber(shopify.products_count) : "Coming soon",
      },
      {
        label: "Average Order",
        value: formatCurrency(shopify?.average_order_value || 0),
      },
      {
        label: "API Status",
        value: account.sync_status || "Unknown",
      },
      {
        label: "Last Synced",
        value: formatDate(account.last_synced_at),
      },
    ];
  }

  if (platformSlug === "twitch") {
    return [
      {
        label: "Synced Revenue",
        value: formatCurrency(syncedRevenueTotal),
      },
      {
        label: "Broadcaster Type",
        value: twitch?.broadcaster_type || "Connected",
      },
      {
        label: "Views",
        value: twitch ? formatNumber(twitch.view_count) : "Coming soon",
      },
      {
        label: "Profile",
        value: twitch?.profile_image_url ? "Connected" : "Coming soon",
      },
      {
        label: "API Status",
        value: account.sync_status || "Unknown",
      },
      {
        label: "Last Synced",
        value: formatDate(account.last_synced_at),
      },
    ];
  }

  return [
    {
      label: "Synced Revenue",
      value: formatCurrency(syncedRevenueTotal),
    },
    {
      label: "Subscribers",
      value: youtube ? formatNumber(youtube.subscriber_count) : "Coming soon",
    },
    {
      label: "Views",
      value: youtube ? formatNumber(youtube.view_count) : "Coming soon",
    },
    {
      label: "Videos",
      value: youtube ? formatNumber(youtube.video_count) : "Coming soon",
    },
    {
      label: "API Status",
      value: account.sync_status || "Unknown",
    },
    {
      label: "Last Synced",
      value: formatDate(account.last_synced_at),
    },
  ];
}

function getHistoryTitle(platformName) {
  return `${platformName} Revenue History`;
}

function getHistoryDescription(platformName) {
  return `Monthly revenue synced from ${platformName}.`;
}

export default function PlatformRevenuePage() {
  const params = useParams();

  const platformSlug = params.platform;
  const platformName = formatPlatformName(platformSlug);

  const {
    loading,
    account,
    revenueEntries,
    syncing,
    syncMessage,
    syncError,
    handleSyncNow,
  } = usePlatformRevenueData(platformSlug);

  const roadmap = platformRoadmaps[platformSlug] || {
    connectedNow: [],
    comingNext: [],
  };

  const detailCards = account
    ? buildDetailCards({ platformSlug, account, revenueEntries })
    : [];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        Loading platform...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-5 py-8 text-white md:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <Link
          href="/revenue"
          className="inline-block rounded-2xl border border-zinc-700 px-5 py-3 hover:bg-zinc-800"
        >
          Back to Revenue
        </Link>

        <section className="rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6 md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Platform Details
              </p>

              <h1 className="mt-2 text-4xl font-bold md:text-5xl">
                {account?.account_name || platformName}
              </h1>

              <p className="mt-4 max-w-3xl text-zinc-400">
                Detailed analytics, revenue, audience, and API data for this
                connected platform.
              </p>
            </div>

            {account && (
              <button
                onClick={handleSyncNow}
                disabled={syncing}
                className="rounded-2xl bg-white px-6 py-3 font-semibold text-black hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {syncing ? "Syncing..." : "Sync Now"}
              </button>
            )}
          </div>
        </section>

        {syncMessage && (
          <div className="rounded-2xl border border-green-900 bg-green-950 p-4 text-sm text-green-400">
            {syncMessage}
          </div>
        )}

        {syncError && (
          <div className="rounded-2xl border border-red-900 bg-red-950 p-4 text-sm text-red-400">
            {syncError}
          </div>
        )}

        {!account ? (
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-2xl font-bold">Not Connected</h2>

            <p className="mt-2 text-zinc-400">
              This platform is not connected yet.
            </p>

            <Link
              href={`/connected-accounts/${platformSlug}`}
              className="mt-5 inline-block rounded-2xl bg-white px-6 py-3 font-semibold text-black hover:bg-zinc-200"
            >
              Connect {platformName}
            </Link>
          </section>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-3">
              {detailCards.map((card) => (
                <DetailCard
                  key={card.label}
                  label={card.label}
                  value={card.value}
                />
              ))}
            </section>

            <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="mb-5">
                <h2 className="text-2xl font-bold">Platform Data Roadmap</h2>
                <p className="mt-2 text-zinc-400">
                  Current and upcoming data available for this platform.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                  <h3 className="text-lg font-bold">Connected Now</h3>

                  <div className="mt-4 space-y-2 text-sm text-zinc-300">
                    {roadmap.connectedNow.length === 0 ? (
                      <p className="text-zinc-500">Nothing connected yet</p>
                    ) : (
                      roadmap.connectedNow.map((item) => (
                        <p key={item}>✓ {item}</p>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                  <h3 className="text-lg font-bold">Coming Next</h3>

                  <div className="mt-4 space-y-2 text-sm text-zinc-300">
                    {roadmap.comingNext.map((item) => (
                      <p key={item}>{item}</p>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="mb-5">
                <h2 className="text-2xl font-bold">Top Content</h2>
                <p className="mt-2 text-zinc-400">
                  Future API data for top-performing videos, clips, products, or
                  posts.
                </p>
              </div>

              {platformSlug === "shopify" &&
                account?.metadata?.shopify?.top_products?.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {account.metadata.shopify.top_products.map((product) => (
                      <div
                        key={product.id}
                        className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
                      >
                        <div className="flex gap-4">
                          {product.image_url && (
                            <img
                              src={product.image_url}
                              alt={product.title}
                              className="h-16 w-16 rounded-xl object-cover"
                            />
                          )}

                          <div>
                            <p className="font-semibold">{product.title}</p>
                            <p className="mt-1 text-sm text-zinc-500">
                              {formatCurrency(product.price)}
                            </p>
                            <p className="mt-1 text-sm text-zinc-500">
                              Inventory: {formatNumber(product.inventory_quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                    <p className="font-semibold">No top content synced yet</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      This section will show top videos, products, clips, or posts once deeper
                      platform analytics are connected.
                    </p>
                  </div>
                )}
            </section>

            <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-2xl font-bold">
                {getHistoryTitle(platformName)}
              </h2>

              <p className="mt-2 text-zinc-400">
                {getHistoryDescription(platformName)}
              </p>

              {revenueEntries.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                  <p className="font-semibold">No synced revenue yet</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Run a {platformName} sync to import monthly revenue data.
                  </p>
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {revenueEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
                    >
                      <div>
                        <p className="font-semibold">
                          {formatMonth(entry.entry_month)}
                        </p>
                        <p className="mt-1 text-sm text-zinc-500">
                          {entry.revenue_type}
                        </p>
                      </div>

                      <p className="text-xl font-bold">
                        {formatCurrency(entry.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {account.sync_error && (
                <p className="mt-4 rounded-2xl border border-red-900 bg-red-950 p-4 text-sm text-red-400">
                  {account.sync_error}
                </p>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function DetailCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 break-words text-2xl font-bold">{value}</p>
    </div>
  );
}