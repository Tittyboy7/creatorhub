"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

useEffect(() => {
  async function loadUserAndCart() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);

    if (!user) {
      setCartCount(0);
      return;
    }

    const { count } = await supabase
      .from("cart_items")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    setCartCount(count || 0);
  }

  loadUserAndCart();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(() => {
    loadUserAndCart();
  });

  window.addEventListener("cartUpdated", loadUserAndCart);

  return () => {
    subscription.unsubscribe();
    window.removeEventListener(
      "cartUpdated",
      loadUserAndCart
    );
  };
}, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  const cartLabel =
    cartCount > 0 ? `Cart (${cartCount})` : "Cart";

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" onClick={closeMenu} className="flex flex-col">
          <span className="text-2xl font-bold">CreatorHub</span>
          <span className="text-zinc-400 text-sm hidden sm:block">
            One platform for creators to sell everything.
          </span>
        </Link>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden border border-zinc-700 px-4 py-2 rounded-xl"
        >
          {menuOpen ? "Close" : "Menu"}
        </button>

        <nav className="hidden md:flex items-center gap-6 text-zinc-300">
          <Link href="/" className="hover:text-white transition">
            Home
          </Link>

          <Link href="/creators" className="hover:text-white transition">
            Creators
          </Link>

          <Link href="/store" className="hover:text-white transition">
            Marketplace
          </Link>

          {user ? (
            <>
              <Link href="/dashboard" className="hover:text-white transition">
                Dashboard
              </Link>

              <Link href="/favorites" className="hover:text-white transition">
                Favorites
              </Link>

              <Link href="/following" className="hover:text-white transition">
                Following
              </Link>

              <Link href="/feed" className="hover:text-white transition">
                Feed
              </Link>

              <Link href="/cart" className="hover:text-white transition">
                {cartLabel}
              </Link>

              <button
                onClick={handleLogout}
                className="bg-white text-black px-4 py-2 rounded-xl font-semibold"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-white text-black px-4 py-2 rounded-xl font-semibold"
            >
              Login
            </Link>
          )}
        </nav>
      </div>

      {menuOpen && (
        <nav className="md:hidden px-6 pb-6 space-y-3 text-zinc-300">
          <Link
            href="/"
            onClick={closeMenu}
            className="block border border-zinc-800 rounded-2xl p-4"
          >
            Home
          </Link>

          <Link
            href="/creators"
            onClick={closeMenu}
            className="block border border-zinc-800 rounded-2xl p-4"
          >
            Creators
          </Link>

          <Link
            href="/store"
            onClick={closeMenu}
            className="block border border-zinc-800 rounded-2xl p-4"
          >
            Marketplace
          </Link>

          {user ? (
            <>
              <Link
                href="/dashboard"
                onClick={closeMenu}
                className="block border border-zinc-800 rounded-2xl p-4"
              >
                Dashboard
              </Link>

              <Link
                href="/favorites"
                onClick={closeMenu}
                className="block border border-zinc-800 rounded-2xl p-4"
              >
                Favorites
              </Link>

              <Link
                href="/following"
                onClick={closeMenu}
                className="block border border-zinc-800 rounded-2xl p-4"
              >
                Following
              </Link>

              <Link
                href="/feed"
                onClick={closeMenu}
                className="block border border-zinc-800 rounded-2xl p-4"
              >
                Feed
              </Link>

              <Link
                href="/cart"
                onClick={closeMenu}
                className="block border border-zinc-800 rounded-2xl p-4"
              >
                {cartLabel}
              </Link>

              <button
                onClick={handleLogout}
                className="w-full text-left bg-white text-black rounded-2xl p-4 font-semibold"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={closeMenu}
              className="block bg-white text-black rounded-2xl p-4 font-semibold"
            >
              Login
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}