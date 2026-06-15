import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value || 0));
}

export default async function HomePage() {
  const { data: creators } = await supabase.from("creators").select("*").limit(3);

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .limit(6);

  const { data: revenueEntries } = await supabase
    .from("revenue_entries")
    .select("*")
    .limit(50);

  const totalRevenue = (revenueEntries || []).reduce(
    (sum, entry) => sum + Number(entry.amount || 0),
    0
  );

  const platformTotals = (revenueEntries || []).reduce((totals, entry) => {
    totals[entry.platform] =
      (totals[entry.platform] || 0) + Number(entry.amount || 0);
    return totals;
  }, {});

  const topPlatforms = Object.entries(platformTotals)
    .map(([platform, amount]) => ({ platform, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-zinc-950 px-5 py-8 text-white md:p-10">
      <div className="mx-auto max-w-7xl space-y-16">
        <section className="grid gap-8 rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6 md:grid-cols-[1fr_0.9fr] md:p-10">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              CreatorsHub
            </p>

            <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
              The operating system for creator businesses.
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-zinc-400">
              Track revenue, manage products, publish announcements, and
              understand your creator business from one dashboard.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="rounded-2xl bg-white px-6 py-3 font-semibold text-black hover:bg-zinc-200"
              >
                Get Started Free
              </Link>

              <Link
                href="/revenue"
                className="rounded-2xl border border-zinc-700 px-6 py-3 font-semibold hover:bg-zinc-800"
              >
                View Revenue Demo
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-zinc-500">Creators</p>
                <p className="mt-1 text-2xl font-bold">{creators?.length || 0}</p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-zinc-500">Products</p>
                <p className="mt-1 text-2xl font-bold">{products?.length || 0}</p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-zinc-500">Tracked</p>
                <p className="mt-1 text-2xl font-bold">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950 p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Revenue Dashboard</p>
                <h2 className="mt-1 text-3xl font-bold">
                  {formatCurrency(totalRevenue)}
                </h2>
              </div>

              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">
                Live Preview
              </span>
            </div>

            <div className="space-y-3">
              {topPlatforms.length === 0 ? (
                <p className="rounded-2xl border border-zinc-800 bg-black p-4 text-sm text-zinc-400">
                  Add revenue entries to preview platform performance.
                </p>
              ) : (
                topPlatforms.map((item) => {
                  const percent =
                    totalRevenue === 0
                      ? 0
                      : Math.round((item.amount / totalRevenue) * 100);

                  return (
                    <div
                      key={item.platform}
                      className="rounded-2xl border border-zinc-800 bg-black p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <p className="font-semibold">{item.platform}</p>
                        <p className="text-sm text-zinc-400">
                          {formatCurrency(item.amount)}
                        </p>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-white"
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      <p className="mt-2 text-xs text-zinc-500">
                        {percent}% of tracked revenue
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        <section>
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Built For
            </p>

            <h2 className="mt-2 text-3xl font-bold md:text-4xl">
              Creators with multiple income streams.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {[
              ["Streamers", "Track Twitch, Kick, donations, merch, and sponsors."],
              ["YouTubers", "Track ads, sponsorships, products, and affiliate revenue."],
              ["Small Brands", "Monitor product sales, audience growth, and storefront performance."],
              ["Digital Sellers", "Manage products, courses, downloads, and creator income."],
            ].map(([title, text]) => (
              <div
                key={title}
                className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5"
              >
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900 p-6 md:p-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Revenue Intelligence
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              Know exactly where your money comes from.
            </h2>

            <p className="mt-4 text-zinc-400">
              Track income from platforms, products, sponsors, subscriptions,
              donations, ads, and more. Manual entries work today. API
              integrations can come later.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {["YouTube", "Twitch", "Kick", "Sponsors", "Products", "Ads"].map(
                (item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm font-semibold"
                  >
                    {item}
                  </div>
                )
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900 p-6 md:p-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Creator Storefront
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              Give your audience one place to find everything.
            </h2>

            <p className="mt-4 text-zinc-400">
              Creators can showcase products, announcements, reviews, featured
              items, social links, and storefront activity in one branded page.
            </p>

            <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-zinc-700" />

                <div>
                  <p className="font-bold">Creator Storefront</p>
                  <p className="text-sm text-zinc-500">
                    Products · Announcements · Reviews
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-zinc-800 bg-black p-4">
                <p className="text-sm text-zinc-500">Featured Product</p>
                <p className="mt-1 text-xl font-bold">Creator Offer</p>
                <p className="mt-3 text-sm text-zinc-400">
                  Highlight products, services, or external links.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">
              Everything in one creator dashboard.
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-zinc-400">
              Replace scattered spreadsheets, disconnected storefront links,
              and manual tracking with one organized workspace.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {[
              ["Revenue Tracking", "Compare income streams and monthly performance."],
              ["Products", "Manage products and external checkout links."],
              ["Announcements", "Keep followers updated from your storefront."],
              ["Analytics", "Monitor views, favorites, reviews, and growth."],
            ].map(([title, text]) => (
              <div
                key={title}
                className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5"
              >
                <h3 className="font-bold">{title}</h3>
                <p className="mt-3 text-sm text-zinc-400">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-zinc-800 bg-zinc-900 p-6 md:p-8">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Pricing
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                Start free. Upgrade when you need deeper insights.
              </h2>
            </div>

            <Link
              href="/pricing"
              className="text-sm font-semibold text-zinc-400 hover:text-white"
            >
              View full pricing →
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <h3 className="text-2xl font-bold">Free</h3>
              <p className="mt-2 text-zinc-400">
                Build your storefront and start tracking your creator business.
              </p>

              <p className="mt-6 text-4xl font-bold">$0</p>

              <Link
                href="/signup"
                className="mt-6 inline-block rounded-2xl bg-white px-6 py-3 font-semibold text-black hover:bg-zinc-200"
              >
                Create Account
              </Link>
            </div>

            <div className="rounded-3xl border border-zinc-700 bg-black p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-2xl font-bold">Creator Pro</h3>

                <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
                  Coming Soon
                </span>
              </div>

              <p className="mt-2 text-zinc-400">
                Premium analytics, advanced reports, and future platform
                integrations.
              </p>

              <p className="mt-6 text-4xl font-bold">Monthly</p>

              <Link
                href="/pricing"
                className="mt-6 inline-block rounded-2xl border border-zinc-700 px-6 py-3 font-semibold hover:bg-zinc-800"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 to-black p-8 text-center md:p-12">
          <h2 className="text-3xl font-bold md:text-5xl">
            Build your creator business with clarity.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
            Track your revenue, organize your products, grow your audience, and
            give fans one place to find everything you create.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-2xl bg-white px-8 py-4 font-semibold text-black hover:bg-zinc-200"
            >
              Get Started Free
            </Link>

            <Link
              href="/dashboard"
              className="rounded-2xl border border-zinc-700 px-8 py-4 font-semibold hover:bg-zinc-800"
            >
              Open Dashboard
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}