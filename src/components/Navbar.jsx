"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    }

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <header className="flex items-center justify-between border-b border-zinc-800 pb-6">
      <div>
        <h1 className="text-4xl font-bold">
          CreatorHub
        </h1>

        <p className="text-zinc-400 mt-2">
          One platform for creators to sell everything.
        </p>
      </div>

      <nav className="hidden md:flex items-center gap-6 text-zinc-300">
        <Link href="/">Home</Link>

        <Link href="/creator">
          Creators
        </Link>

        <Link href="/store">
          Store
        </Link>

        {user ? (
          <>
            <Link href="/dashboard">
              Dashboard
            </Link>

            <button onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <Link href="/login">
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}