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
    } else {
      alert("Revenue entry updated!");
      router.push("/revenue");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 w-full max-w-xl">
        <h1 className="text-4xl font-bold mb-3">Edit Revenue</h1>

        <p className="text-zinc-400 mb-4">
          Update this revenue entry.
        </p>

        <Link
          href="/revenue"
          className="inline-block mb-8 border border-zinc-700 px-5 py-3 rounded-2xl hover:bg-zinc-800"
        >
          Back to Revenue
        </Link>

        <form onSubmit={handleUpdate} className="space-y-6">
          <select
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
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

          <select
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
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

          <input
            type="number"
            step="0.01"
            min="0"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <input
            type="month"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
            value={entryMonth}
            onChange={(e) => setEntryMonth(e.target.value)}
          />

          <textarea
            placeholder="Notes optional..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4 h-32"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-white text-black py-4 rounded-2xl font-semibold disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Revenue Entry"}
          </button>
        </form>
      </div>
    </div>
  );
}