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
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 w-full max-w-xl">
        <h1 className="text-4xl font-bold mb-3">Add Revenue</h1>

        <p className="text-zinc-400 mb-4">
          Track income from creator platforms, products, donations, and more.
        </p>

        <Link
          href="/dashboard"
          className="inline-block mb-8 border border-zinc-700 px-5 py-3 rounded-2xl hover:bg-zinc-800"
        >
          Back to Dashboard
        </Link>

        <form onSubmit={handleSubmit} className="space-y-6">
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
            placeholder="Amount, e.g. 125.50"
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
            {isSubmitting ? "Saving..." : "Add Revenue Entry"}
          </button>
        </form>
      </div>
    </div>
  );
}