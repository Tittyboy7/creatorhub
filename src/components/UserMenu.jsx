"use client";

import Link from "next/link";

export default function UserMenu({
  notificationLabel,
  purchaseListLabel,
  isAdmin,
  onLogout,
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 space-y-2">
      <Link href="/dashboard" className="block p-3 rounded-2xl hover:bg-zinc-800">
        Dashboard
      </Link>

      <Link href="/notifications" className="block p-3 rounded-2xl hover:bg-zinc-800">
        {notificationLabel}
      </Link>

      <Link href="/revenue" className="block p-3 rounded-2xl hover:bg-zinc-800">
        Revenue
      </Link>

      {isAdmin && (
        <Link href="/admin" className="block p-3 rounded-2xl hover:bg-zinc-800">
          Admin
        </Link>
      )}

      <Link href="/favorites" className="block p-3 rounded-2xl hover:bg-zinc-800">
        Favorites
      </Link>

      <Link href="/following" className="block p-3 rounded-2xl hover:bg-zinc-800">
        Following
      </Link>

      <Link href="/feed" className="block p-3 rounded-2xl hover:bg-zinc-800">
        Feed
      </Link>

      <Link href="/cart" className="block p-3 rounded-2xl hover:bg-zinc-800">
        {purchaseListLabel}
      </Link>

      <button
        onClick={onLogout}
        className="w-full text-left bg-white text-black p-3 rounded-2xl font-semibold"
      >
        Logout
      </button>
    </div>
  );
}