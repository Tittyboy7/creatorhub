"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import UserMenu from "@/components/UserMenu";

export default function Navbar() {
  const router = useRouter();
  const userMenuRef = useRef(null);

  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    async function loadUserData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      if (!user) {
        setCartCount(0);
        setNotificationCount(0);
        setIsAdmin(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      setIsAdmin(profile?.is_admin || false);

      const { data: unreadNotifications } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_read", false);

      setNotificationCount((unreadNotifications || []).length);

      const { data: activeCartItems } = await supabase
        .from("cart_items")
        .select(`
          id,
          products (
            is_active
          )
        `)
        .eq("user_id", user.id);

      const activeCount = (activeCartItems || []).filter(
        (item) => item.products?.is_active
      ).length;

      setCartCount(activeCount);
    }

    loadUserData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUserData();
    });

    window.addEventListener("cartUpdated", loadUserData);
    window.addEventListener("notificationsUpdated", loadUserData);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("cartUpdated", loadUserData);
      window.removeEventListener("notificationsUpdated", loadUserData);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target)
      ) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleLogout() {
    const confirmed = confirm("Are you sure you want to log out?");

    if (!confirmed) return;

    await supabase.auth.signOut();
    setMenuOpen(false);
    setUserMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  function closeMenu() {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }

  const purchaseListLabel =
    cartCount > 0 ? `Purchase List (${cartCount})` : "Purchase List";

  const notificationLabel =
    notificationCount > 0
      ? `Notifications (${notificationCount})`
      : "Notifications";

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" onClick={closeMenu} className="flex flex-col">
          <span className="text-2xl font-bold">CreatorsHub</span>
          <span className="text-zinc-400 text-sm hidden sm:block">
            Build your creator business in one place.
          </span>
        </Link>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden border border-zinc-700 px-4 py-2 rounded-xl"
        >
          {menuOpen ? "Close ✕" : "Menu ☰"}
        </button>

        <nav className="hidden md:flex items-center gap-6 text-zinc-300">
          <Link href="/" className="hover:text-white transition">
            Home
          </Link>

          <Link href="/creators" className="hover:text-white transition">
            Creators
          </Link>

          <Link href="/store" className="hover:text-white transition">
            Store
          </Link>

          <Link href="/announcements" className="hover:text-white transition">
            Announcements
          </Link>

          <Link href="/pricing" className="hover:text-white transition">
            Pricing
          </Link>

          <Link href="/roadmap" className="hover:text-white transition">
            Roadmap
          </Link>

          <Link href="/search" className="hover:text-white transition">
            Search
          </Link>

          {user ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-xl border border-zinc-700 px-4 py-2 font-semibold hover:border-zinc-500 hover:bg-zinc-800 transition"
              >
                Dashboard
              </Link>

              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 font-semibold text-black transition hover:bg-zinc-200"
                >
                  <span>Account</span>
                  {notificationCount > 0 && (
                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                      {notificationCount}
                    </span>
                  )}
                  <span className={`transition ${userMenuOpen ? "rotate-180" : ""}`}>
                    ▼
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-3 w-64 z-50">
                    <UserMenu
                      userEmail={user?.email}
                      notificationLabel={notificationLabel}
                      purchaseListLabel={purchaseListLabel}
                      isAdmin={isAdmin}
                      onLogout={handleLogout}
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/signup" className="hover:text-white transition">
                Create Account
              </Link>

              <Link
                href="/login"
                className="bg-white text-black px-4 py-2 rounded-xl font-semibold"
              >
                Login
              </Link>
            </div>
          )}
        </nav>
      </div>

      {menuOpen && (
        <nav className="md:hidden px-6 pb-6 space-y-3 text-zinc-300 max-h-[calc(100vh-90px)] overflow-y-auto">
          <p className="text-zinc-500 text-sm uppercase tracking-wide px-1">
            Navigation
          </p>

          <Link href="/" onClick={closeMenu} className="block border border-zinc-800 rounded-2xl p-4">
            Home
          </Link>

          <Link href="/creators" onClick={closeMenu} className="block border border-zinc-800 rounded-2xl p-4">
            Creators
          </Link>

          <Link href="/store" onClick={closeMenu} className="block border border-zinc-800 rounded-2xl p-4">
            Store
          </Link>

          <Link href="/announcements" onClick={closeMenu} className="block border border-zinc-800 rounded-2xl p-4">
            Announcements
          </Link>

          <Link href="/pricing" onClick={closeMenu} className="block border border-zinc-800 rounded-2xl p-4">
            Pricing
          </Link>

          <Link href="/roadmap" onClick={closeMenu} className="block border border-zinc-800 rounded-2xl p-4">
            Roadmap
          </Link>

          <Link href="/search" onClick={closeMenu} className="block border border-zinc-800 rounded-2xl p-4">
            Search
          </Link>

          {user ? (
            <>
              <p className="text-zinc-500 text-sm uppercase tracking-wide px-1">
                Account
              </p>

              <Link
                href="/dashboard"
                onClick={closeMenu}
                className="block rounded-2xl bg-white p-4 font-semibold text-black"
              >
                Dashboard
              </Link>

              <Link href="/notifications" onClick={closeMenu} className="block border border-zinc-800 rounded-2xl p-4">
                {notificationLabel}
              </Link>

              <Link href="/revenue" onClick={closeMenu} className="block border border-zinc-800 rounded-2xl p-4">
                Revenue
              </Link>

              {isAdmin && (
                <Link href="/admin" onClick={closeMenu} className="block border border-zinc-800 rounded-2xl p-4">
                  Admin
                </Link>
              )}

              <Link href="/favorites" onClick={closeMenu} className="block border border-zinc-800 rounded-2xl p-4">
                Favorites
              </Link>

              <Link href="/following" onClick={closeMenu} className="block border border-zinc-800 rounded-2xl p-4">
                Following
              </Link>

              <Link href="/feed" onClick={closeMenu} className="block border border-zinc-800 rounded-2xl p-4">
                Feed
              </Link>

              <Link href="/cart" onClick={closeMenu} className="block border border-zinc-800 rounded-2xl p-4">
                {purchaseListLabel}
              </Link>

              <button
                onClick={handleLogout}
                className="w-full text-left bg-white text-black rounded-2xl p-4 font-semibold"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/signup" onClick={closeMenu} className="block border border-zinc-800 rounded-2xl p-4">
                Create Account
              </Link>

              <Link href="/login" onClick={closeMenu} className="block bg-white text-black rounded-2xl p-4 font-semibold">
                Login
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}