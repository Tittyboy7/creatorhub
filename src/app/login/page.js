"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      router.push("/dashboard");
    }
  }

  async function handleSignup() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Account created!");
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 w-full max-w-md">
        <h1 className="text-4xl font-bold mb-8 text-center">
          CreatorHub Login
        </h1>

        <form
          onSubmit={handleLogin}
          className="space-y-6"
        >
          <input
            type="email"
            placeholder="Email"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="w-full bg-white text-black py-4 rounded-2xl font-semibold"
          >
            Login
          </button>
        </form>

        <button
          onClick={handleSignup}
          className="w-full mt-4 border border-zinc-700 py-4 rounded-2xl"
        >
          Create Account
        </button>
      </div>
    </div>
  );
}