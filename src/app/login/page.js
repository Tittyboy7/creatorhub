"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (
        error.message.toLowerCase().includes("email") ||
        error.message.toLowerCase().includes("confirm")
      ) {
        setErrorMessage(
          "Please confirm your email before logging in. Check your inbox or spam folder."
        );
      } else {
        setErrorMessage(error.message);
      }
      setIsSubmitting(false);

      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 w-full max-w-md">
        <h1 className="text-4xl font-bold mb-8 text-center">
          CreatorsHub Login
        </h1>

        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 rounded-2xl p-4 mb-6">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
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
            disabled={isSubmitting}
            className="w-full bg-white text-black py-4 rounded-2xl font-semibold disabled:opacity-50"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-zinc-400 mt-6">
          Need an account?{" "}
          <Link href="/signup" className="text-white underline">
            Create one
          </Link>
        </p>

        <Link
          href="/signup"
          className="block w-full mt-4 border border-zinc-700 py-4 rounded-2xl text-center hover:bg-zinc-800"
        >
          Create Account
        </Link>
      </div>
    </div>
  );
}