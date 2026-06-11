"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AddRevenuePage() {
  const router = useRouter();

  const [platform, setPlatform] = useState("");
  const [revenueType, setRevenueType] = useState("");
  const [amount, setAmount] = useState("");
  const [entryMonth, setEntryMonth] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!platform) {
      alert("Please select a platform.");
      return;
    }

    if (!revenueType) {
      alert("Please select a revenue type.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    if (!entryMonth) {
      alert("Please select a month.");
      return;
    }

    setIsSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in.");
      setIsSubmitting(false);
      return;
    }

    const { data: creator } = await supabase
      .from("creators")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!creator) {
      alert("You must create a creator profile first.");
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.from("revenue_entries").insert({
      user_id: user.id,
      creator_id: creator.id,
      platform,
      revenue_type: revenueType,
      amount: Number(amount),
      entry_month: entryMonth,
      notes: notes.trim(),
    });

    if (error) {
      alert(error.message);
      setIsSubmitting(false);
    } else {
      alert("Revenue entry added!");
      router.push("/revenue");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-5 py-8 text-white md:p-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <Link
          href="/revenue"
          className="inline-block rounded-2xl border border-zinc-700 px-5 py-3 hover:bg-zinc-800"
        >
          Back to Revenue
        </Link>

        <section className="rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6 shadow-2xl md:p-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Revenue Entry
          </p>

          <h1 className="text-4xl font-bold md:text-5xl">
            Add Revenue
          </h1>

          <p className="mt-4 max-w-3xl text-zinc-400">
            Log income from creator platforms, products, donations, subscriptions,
            sponsorships, and other revenue streams.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
          >
            <div className="grid gap-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-400">
                  Platform
                </label>

                <select
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 p-4"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                >
                  <option value="">Select Platform</option>
                  <option value="Twitch">Twitch</option>
                  <option value="Kick">Kick</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Products">Products</option>
                  <option value="Sponsorship">Sponsorship</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-400">
                  Revenue Type
                </label>

                <select
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 p-4"
                  value={revenueType}
                  onChange={(e) => setRevenueType(e.target.value)}
                >
                  <option value="">Select Revenue Type</option>
                  <option value="Subs">Subs</option>
                  <option value="Donations">Donations</option>
                  <option value="Ads">Ads</option>
                  <option value="Product Sales">Product Sales</option>
                  <option value="Sponsorship">Sponsorship</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-400">
                  Amount
                </label>

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="125.50"
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 p-4"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-400">
                  Month
                </label>

                <input
                  type="month"
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 p-4"
                  value={entryMonth}
                  onChange={(e) => setEntryMonth(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-400">
                  Notes
                </label>

                <textarea
                  placeholder="Optional notes about this revenue entry..."
                  className="h-32 w-full rounded-2xl border border-zinc-700 bg-zinc-800 p-4"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-white py-4 font-semibold text-black hover:bg-zinc-200 disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Add Revenue Entry"}
              </button>
            </div>
          </form>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-2xl font-bold">
                What to track
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                Add revenue from streaming platforms, product sales, donations,
                ad payouts, memberships, sponsorships, affiliate deals, or any
                other creator income source.
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-2xl font-bold">
                Future syncing
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                Manual tracking works now. Later, connected APIs can help pull
                revenue, subscribers, donations, and platform metrics automatically.
              </p>
            </div>

            <Link
              href="/import-revenue"
              className="block rounded-3xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-zinc-600 hover:bg-zinc-800"
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Bulk Entry
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Import CSV
              </h2>

              <p className="mt-3 text-sm text-zinc-400">
                Upload multiple revenue entries at once instead of adding them manually.
              </p>
            </Link>
          </aside>
        </section>
      </div>
    </div>
  );
}