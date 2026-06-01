"use client";

import Link from "next/link";

export default function UserMenu({
  notificationLabel,
  purchaseListLabel,
  isAdmin,
  onLogout,
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 space-y-2 shadow-2xl">
      <Link href="/dashboard" className="block p-3 rounded-2xl hover:bg-zinc-800 transition">
        Dashboard
      </Link>

      <Link href="/notifications" className="block p-3 rounded-2xl hover:bg-zinc-800 transition">
        {notificationLabel}
      </Link>

      <Link href="/revenue" className="block p-3 rounded-2xl hover:bg-zinc-800 transition">
        Revenue
      </Link>

      {isAdmin && (
        <Link href="/admin" className="block p-3 rounded-2xl hover:bg-zinc-800 transition">
          Admin
        </Link>
      )}

      <Link href="/favorites" className="block p-3 rounded-2xl hover:bg-zinc-800 transition">
        Favorites
      </Link>

      <Link href="/following" className="block p-3 rounded-2xl hover:bg-zinc-800 transition">
        Following
      </Link>

      <Link href="/feed" className="block p-3 rounded-2xl hover:bg-zinc-800 transition">
        Feed
      </Link>

      <Link href="/cart" className="block p-3 rounded-2xl hover:bg-zinc-800 transition">
        {purchaseListLabel}
      </Link>

      <button
        onClick={onLogout}
        className="w-full text-left bg-white text-black p-3 rounded-2xl font-semibold transition hover:bg-gray-200"
      >
        Logout
      </button>
    </div>
  );
}