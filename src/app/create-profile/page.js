"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CreateProfilePage() {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [niche, setNiche] = useState("");
  const [bio, setBio] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in.");
      return;
    }

    const { error } = await supabase
      .from("creators")
      .insert({
        user_id: user.id,
        display_name: displayName,
        username: username.toLowerCase(),
        niche,
        bio,
      });

    if (error) {
      alert(error.message);
    } else {
      alert("Profile created!");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 w-full max-w-xl">
        <h1 className="text-4xl font-bold mb-8">
          Create Creator Profile
        </h1>

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
            className="w-full bg-white text-black py-4 rounded-2xl font-semibold"
          >
            Create Profile
          </button>
        </form>
      </div>
    </div>
  );
}