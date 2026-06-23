import { formatCurrency } from "@/lib/formatCurrency";
import PlatformMetric from "./PlatformMetric";
import Link from "next/link";

export default function PlatformHealthSection({ platformHealthCards }) {
  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Platform Health</h2>
          <p className="mt-1 text-sm text-zinc-500">
            API-ready overview for each connected revenue platform.
          </p>
        </div>

        <span className="rounded-2xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300">
          Future API Slot
        </span>
      </div>

      {platformHealthCards.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-center">
          <h3 className="text-lg font-bold">No platforms tracked yet</h3>
          <p className="mt-2 text-sm text-zinc-500">
            Add revenue entries to start building platform health data.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {platformHealthCards.map((platform) => (
            <div
              key={platform.platform}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold">{platform.platform}</h3>
                  <p className="mt-1 text-xs text-zinc-500">
                    {platform.status}
                  </p>
                </div>

                <span className="rounded-xl border border-zinc-700 px-3 py-1 text-xs text-zinc-300">
                  Active
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <PlatformMetric label="Revenue" value={formatCurrency(platform.revenue)} />
                <PlatformMetric label="Growth" value={platform.growth} />
                <PlatformMetric label="Audience" value={platform.audience} />

                {platform.platform.toLowerCase() === "youtube" ? (
                  <>
                    <PlatformMetric label="Views" value={platform.views} />
                    <PlatformMetric label="Videos" value={platform.productsSold} />
                  </>
                ) : platform.platform.toLowerCase() === "twitch" ? (
                  <>
                    <PlatformMetric label="Views" value={platform.views} />
                    <PlatformMetric label="Profile" value={platform.productsSold} />
                  </>
                ) : platform.platform.toLowerCase() === "kick" ? (
                  <>
                    <PlatformMetric label="Channel" value={platform.audience} />
                    <PlatformMetric label="Profile" value={platform.productsSold} />
                  </>
                ) : platform.platform.toLowerCase() === "patreon" ? (
                  <>
                    <PlatformMetric label="Patrons" value={platform.audience} />
                    <PlatformMetric label="Campaign" value={platform.productsSold} />
                  </>
                ) : platform.platform.toLowerCase() === "stripe" ? (
                  <>
                    <PlatformMetric label="Customers" value={platform.audience} />
                    <PlatformMetric label="Payments" value={platform.orders} />
                    <PlatformMetric label="Charges" value={platform.productsSold} />
                    <PlatformMetric label="Currency" value={platform.views} />
                  </>
                ) : platform.platform.toLowerCase() === "shopify" ? (
                  <>
                    <PlatformMetric label="Avg Order" value={platform.orders} />
                    <PlatformMetric label="Products" value={platform.productsSold} />
                    <PlatformMetric label="Currency" value={platform.views} />
                  </>
                ) : (
                  <>
                    <PlatformMetric label="Orders" value={platform.orders} />
                    <PlatformMetric label="Products Sold" value={platform.productsSold} />
                  </>
                )}

                <PlatformMetric label="API Status" value={platform.status} />
              </div>

              <Link
                href={`/revenue/platforms/${platform.platform.toLowerCase()}`}
                className="mt-4 block rounded-2xl border border-zinc-700 px-4 py-3 text-center text-sm font-semibold hover:bg-zinc-800"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}