"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function EditRevenuePage() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [platform, setPlatform] = useState("");
  const [revenueType, setRevenueType] = useState("");
  const [amount, setAmount] = useState("");
  const [entryMonth, setEntryMonth] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadEntry() {
      const { data, error } = await supabase
        .from("revenue_entries")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) {
        alert(error.message);
        router.push("/revenue");
        return;
      }

      setPlatform(data.platform || "");
      setRevenueType(data.revenue_type || "");
      setAmount(data.amount || "");
      setEntryMonth(data.entry_month || "");
      setNotes(data.notes || "");
      setLoading(false);
    }

    loadEntry();
  }, [params.id, router]);

  async function handleUpdate(e) {
    e.preventDefault();

    if (!platform || !revenueType || !amount || !entryMonth) {
      alert("Please fill out all required fields.");
      return;
    }

    if (Number(amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase
      .from("revenue_entries")
      .update({
        platform,
        revenue_type: revenueType,
        amount: Number(amount),
        entry_month: entryMonth,
        notes: notes.trim(),
      })
      .eq("id", params.id);

    if (error) {
      alert(error.message);
      setIsSubmitting(false);
      return;
    }

    router.push("/revenue");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        Loading revenue entry...
      </div>
    );
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
            Edit Revenue
          </h1>

          <p className="mt-4 max-w-3xl text-zinc-400">
            Update a revenue record so your dashboard, platform totals, and monthly
            charts stay accurate.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <form
            onSubmit={handleUpdate}
            className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
          >
            <div className="grid gap-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-400">
                  Platform
                </label>

                <select
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 p-4 outline-none focus:border-zinc-500"
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
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 p-4 outline-none focus:border-zinc-500"
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
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 p-4 outline-none focus:border-zinc-500"
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
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 p-4 outline-none focus:border-zinc-500"
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
                  className="h-32 w-full rounded-2xl border border-zinc-700 bg-zinc-800 p-4 outline-none focus:border-zinc-500"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-white py-4 font-semibold text-black hover:bg-zinc-200 disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-2xl font-bold">
                Keep records clean
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                Accurate platform, type, amount, and month values help your dashboard
                compare income streams and show better trends.
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-2xl font-bold">
                Future API syncing
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                Later, connected platform APIs can update revenue, subscribers,
                donations, and other metrics automatically.
              </p>
            </div>

            <Link
              href="/revenue"
              className="block rounded-3xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-zinc-600 hover:bg-zinc-800"
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Dashboard
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                View Revenue Dashboard
              </h2>

              <p className="mt-3 text-sm text-zinc-400">
                Return to charts, platform breakdowns, and revenue entries.
              </p>
            </Link>
          </aside>
        </section>
      </div>
    </div>
  );
}