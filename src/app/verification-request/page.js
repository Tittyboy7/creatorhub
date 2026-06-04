"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function VerificationRequestPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [creator, setCreator] = useState(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadCreator() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("creators")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      setCreator(data);
      setLoading(false);
    }

    loadCreator();
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!creator) {
      alert("You need a creator profile before requesting verification.");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase
      .from("verification_requests")
      .insert({
        creator_id: creator.id,
        message,
      });

    setSubmitting(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Verification request submitted.");
    router.push("/dashboard");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-5 py-8 md:p-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Request Verification
        </h1>

        <p className="text-zinc-400 text-lg mb-8">
          Tell us why your creator profile should be reviewed for verification.
        </p>

        {!creator ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <p className="text-zinc-400 mb-6">
              You need to create a creator profile before requesting verification.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8"
          >
            <label className="block text-zinc-400 mb-3">
              Why should this creator profile be verified?
            </label>

            <textarea
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 min-h-40"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 bg-white text-black px-6 py-3 rounded-2xl font-semibold hover:bg-zinc-200 transition disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}