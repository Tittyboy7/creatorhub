"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function CreateProfilePage() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [niche, setNiche] = useState("");
  const [bio, setBio] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setErrorMessage("");

    const cleanUsername = username
      .trim()
      .toLowerCase();

    if (!displayName || !username) {
      setErrorMessage(
        "Display name and username are required."
      );

      return;
    }

    if (!/^[a-z0-9_-]+$/.test(cleanUsername)) {
      setErrorMessage(
        "Username can only contain lowercase letters, numbers, underscores, and hyphens. No spaces."
      );

      return;
    }

    setIsSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrorMessage("You must be logged in.");
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase
      .from("creators")
      .insert({
        user_id: user.id,
        display_name: displayName,
        username: cleanUsername,
        niche,
        bio,
      });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 w-full max-w-xl">
        <h1 className="text-4xl font-bold mb-8">
          Create Creator Profile
        </h1>

        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 rounded-2xl p-4 mb-6">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Display Name"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />

          <input
            type="text"
            placeholder="Username"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="text"
            placeholder="Niche (e.g. Gaming, Art, Fitness)"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
          />

          <textarea
            placeholder="Bio"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4 h-40"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-white text-black py-4 rounded-2xl font-semibold disabled:opacity-50"
          >
            {isSubmitting
              ? "Creating Profile..."
              : "Create Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}