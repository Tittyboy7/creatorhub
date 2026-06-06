"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardRevenuePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [creator, setCreator] = useState(null);
  const [revenueEntries, setRevenueEntries] = useState([]);

  useEffect(() => {
    async function loadRevenue() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: creatorData } = await supabase
        .from("creators")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!creatorData) {
        router.push("/create-profile");
        return;
      }

      setCreator(creatorData);

      const { data, error } = await supabase
        .from("revenue_entries")
        .select("*")
        .eq("creator_id", creatorData.id)
        .order("entry_month", { ascending: false });

      if (error) {
        alert(error.message);
      } else {
        setRevenueEntries(data || []);
      }

      setLoading(false);
    }

    loadRevenue();
  }, [router]);

  const totalRevenue = revenueEntries.reduce(
    (sum, entry) => sum + Number(entry.amount || 0),
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-5 py-8 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold">
              Revenue Management
            </h1>

            <p className="text-zinc-400 mt-3">
              Manage revenue entries for {creator?.display_name}.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="border border-zinc-700 px-5 py-3 rounded-2xl hover:bg-zinc-800 transition"
            >
              Back to Dashboard
            </Link>

            <Link
              href="/add-revenue"
              className="bg-white text-black px-5 py-3 rounded-2xl font-semibold hover:bg-zinc-200 transition"
            >
              Add Revenue
            </Link>

            <Link
              href="/import-revenue"
              className="border border-zinc-700 px-5 py-3 rounded-2xl hover:bg-zinc-800 transition"
            >
              Import CSV
            </Link>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
            <p className="text-zinc-400">Total Revenue</p>
            <p className="text-3xl font-bold mt-2">
              ${totalRevenue.toFixed(2)}
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
            <p className="text-zinc-400">Entries</p>
            <p className="text-3xl font-bold mt-2">
              {revenueEntries.length}
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
            <p className="text-zinc-400">Latest Month</p>
            <p className="text-3xl font-bold mt-2">
              {revenueEntries[0]?.entry_month || "—"}
            </p>
          </div>
        </div>

        {revenueEntries.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-3">
              No revenue entries yet
            </h2>

            <p className="text-zinc-400 mb-6">
              Start tracking income from platforms, products, sponsorships, and more.
            </p>

            <Link
              href="/add-revenue"
              className="inline-block bg-white text-black px-6 py-3 rounded-2xl font-semibold hover:bg-zinc-200 transition"
            >
              Add Revenue
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {revenueEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {entry.platform}
                    </h2>

                    <p className="text-zinc-400 mt-1">
                      {entry.revenue_type} · {entry.entry_month}
                    </p>
                  </div>

                  <p className="text-3xl font-bold">
                    ${Number(entry.amount || 0).toFixed(2)}
                  </p>
                </div>

                {entry.notes && (
                  <p className="text-zinc-400 mt-4">
                    {entry.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}