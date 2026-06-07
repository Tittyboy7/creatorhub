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
        router.push("/dashboard/revenue");
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

    router.push("/dashboard/revenue");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 px-5 py-10 text-white">
        <div className="mx-auto max-w-xl">
          <p className="text-zinc-400">Loading revenue entry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-5 py-10 text-white">
      <div className="mx-auto max-w-xl">
        <div className="mb-6">
          <Link
            href="/dashboard/revenue"
            className="text-sm text-zinc-400 hover:text-white"
          >
            ← Back to Revenue
          </Link>

          <h1 className="mt-4 text-3xl font-bold">Edit Revenue</h1>

          <p className="mt-2 text-zinc-400">
            Update this revenue entry.
          </p>
        </div>

        <form
          onSubmit={handleUpdate}
          className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
        >
          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Platform
            </label>

            <select
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 p-4 outline-none focus:border-zinc-500"
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
            <label className="mb-2 block text-sm text-zinc-400">
              Revenue Type
            </label>

            <select
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 p-4 outline-none focus:border-zinc-500"
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
            <label className="mb-2 block text-sm text-zinc-400">
              Amount
            </label>

            <input
              type="number"
              step="0.01"
              min="0"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 p-4 outline-none focus:border-zinc-500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Month
            </label>

            <input
              type="month"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 p-4 outline-none focus:border-zinc-500"
              value={entryMonth}
              onChange={(e) => setEntryMonth(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Notes
            </label>

            <textarea
              placeholder="Notes optional..."
              className="h-32 w-full rounded-xl border border-zinc-700 bg-zinc-800 p-4 outline-none focus:border-zinc-500"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-white py-4 font-semibold text-black hover:bg-zinc-200 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}