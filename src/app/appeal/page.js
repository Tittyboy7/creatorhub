"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AppealPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [creator, setCreator] = useState(null);
  const [isSuspended, setIsSuspended] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadAppealPage() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_suspended")
        .eq("id", user.id)
        .single();

      setIsSuspended(Boolean(profile?.is_suspended));

      const { data: creatorData } = await supabase
        .from("creators")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      setCreator(creatorData || null);
      setLoading(false);
    }

    loadAppealPage();
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!creator) {
      alert("You need a creator profile before submitting an appeal.");
      return;
    }

    if (!message.trim()) {
      alert("Please explain your appeal.");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("creator_appeals").insert({
      creator_id: creator.id,
      message: message.trim(),
      status: "pending",
    });

    setSubmitting(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Appeal submitted.");
    router.push("/");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        Loading appeal page...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-5 py-8 text-white md:p-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-block rounded-2xl border border-zinc-700 px-5 py-3 hover:bg-zinc-800"
        >
          Back to Home
        </Link>

        <section className="mt-6 rounded-[2rem] border border-zinc-800 bg-zinc-900 p-8">
          <h1 className="text-4xl font-bold">Appeal Suspension</h1>

          <p className="mt-4 text-zinc-400">
            Submit an appeal if you believe your creator account was suspended
            by mistake or if the issue has been resolved.
          </p>

          {!isSuspended && (
            <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-zinc-400">
              Your account is not currently suspended.
            </div>
          )}

          {!creator ? (
            <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-zinc-400">
              You need a creator profile before submitting an appeal.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Explain why your suspension should be reviewed..."
                className="h-48 w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 outline-none focus:border-zinc-600"
              />

              <button
                type="submit"
                disabled={submitting || !isSuspended}
                className="w-full rounded-2xl bg-white py-4 font-semibold text-black hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Appeal"}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}