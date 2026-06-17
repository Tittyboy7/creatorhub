"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function formatDate(dateString) {
  if (!dateString) return "Unknown";

  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminUsersPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadUsers() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to load users.");
        setLoading(false);
        return;
      }

      setUsers(data.users || []);
      setLoading(false);
    }

    loadUsers();
  }, [router]);

  const filteredUsers = users.filter((user) => {
    const searchText = search.toLowerCase();

    return (
      user.email?.toLowerCase().includes(searchText) ||
      user.creator?.display_name?.toLowerCase().includes(searchText) ||
      user.creator?.username?.toLowerCase().includes(searchText)
    );
  });

  async function updateAdminStatus(userId, isAdmin) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
 
    const response = await fetch("/api/admin/users/admin-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        userId,
        isAdmin,
      }),
    });
 
    const data = await response.json();
 
    if (!response.ok) {
      alert(data.error || "Failed to update admin status.");
      return;
    }
 
    setUsers((currentUsers) =>
      currentUsers.map((currentUser) =>
        currentUser.id === userId
          ? { ...currentUser, is_admin: isAdmin }
          : currentUser
      )
    );
  }

  async function updateSuspensionStatus(userId, isSuspended) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
 
    const response = await fetch("/api/admin/users/suspension", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        userId,
        isSuspended,
      }),
    });
 
    const data = await response.json();
 
    if (!response.ok) {
      alert(data.error || "Failed to update suspension status.");
      return;
    }
 
    setUsers((currentUsers) =>
      currentUsers.map((currentUser) =>
        currentUser.id === userId
          ? { ...currentUser, is_suspended: isSuspended }
          : currentUser
      )
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        Loading users...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-10 text-white">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/admin"
          className="inline-block rounded-2xl border border-zinc-700 px-5 py-3 hover:bg-zinc-800"
        >
          Back to Admin
        </Link>

        <section className="mt-6 rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Admin Management
          </p>

          <h1 className="mt-2 text-4xl font-bold">Users</h1>

          <p className="mt-3 text-zinc-400">
            View registered users, emails, creator profiles, and admin status.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-sm text-zinc-500">Total Users</p>
              <p className="mt-1 text-2xl font-bold">{users.length}</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-sm text-zinc-500">Admins</p>
              <p className="mt-1 text-2xl font-bold">
                {users.filter((user) => user.is_admin).length}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-sm text-zinc-500">Creators</p>
              <p className="mt-1 text-2xl font-bold">
                {users.filter((user) => user.creator).length}
              </p>
            </div>
          </div>
        </section>

        <input
          type="text"
          placeholder="Search by email, creator name, or username..."
          className="mt-6 w-full rounded-2xl border border-zinc-700 bg-zinc-900 p-4 outline-none focus:border-zinc-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <p className="mt-4 text-sm text-zinc-500">
          Showing {filteredUsers.length} user
          {filteredUsers.length === 1 ? "" : "s"}
        </p>

        <section className="mt-6 space-y-4">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-bold">{user.email}</h2>

                    {user.is_admin && (
                      <span className="rounded-full bg-blue-950 px-3 py-1 text-xs font-semibold text-blue-400">
                        Admin
                      </span>
                    )}

                    {user.creator ? (
                      <span className="rounded-full bg-green-950 px-3 py-1 text-xs font-semibold text-green-400">
                        Creator
                      </span>
                    ) : (
                      <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-400">
                        No Creator Profile
                      </span>
                    )}

                    {user.creator?.is_verified && (
                      <span className="rounded-full bg-emerald-950 px-3 py-1 text-xs font-semibold text-emerald-400">
                        Verified Creator
                      </span>
                    )}

                    {user.is_suspended && (
                      <span className="rounded-full bg-red-950 px-3 py-1 text-xs font-semibold text-red-400">
                        Suspended
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm text-zinc-500">
                    Joined: {formatDate(user.created_at)}
                  </p>

                  <p className="mt-1 text-sm text-zinc-500">
                    User ID: {user.id}
                  </p>

                  {user.creator ? (
                    <p className="mt-2 text-zinc-400">
                      Creator: {user.creator.display_name} (@
                      {user.creator.username})
                    </p>
                  ) : (
                    <p className="mt-2 text-zinc-500">No creator profile</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  {user.creator && (
                    <Link
                      href={`/creator/${user.creator.username}`}
                      className="rounded-2xl bg-white px-5 py-3 text-center font-semibold text-black hover:bg-zinc-200"
                    >
                      View Storefront
                    </Link>
                  )}

                  {user.creator && (
                    <Link
                      href={`/admin/creators/${user.creator.id}`}
                      className="rounded-2xl border border-zinc-700 px-5 py-3 text-center font-semibold text-zinc-300 hover:bg-zinc-800"
                    >
                      Manage Creator
                    </Link>
                  )}

                  {user.is_admin ? (
                    <button
                      onClick={() => updateAdminStatus(user.id, false)}
                      className="rounded-2xl border border-orange-800 px-5 py-3 text-center font-semibold text-orange-400 hover:bg-orange-950"
                    >
                      Remove Admin
                    </button>
                  ) : (
                    <button
                      onClick={() => updateAdminStatus(user.id, true)}
                      className="rounded-2xl border border-blue-800 px-5 py-3 text-center font-semibold text-blue-400 hover:bg-blue-950"
                    >
                      Make Admin
                    </button>
                  )}

                  {user.is_suspended ? (
                    <button
                      onClick={() => updateSuspensionStatus(user.id, false)}
                      className="rounded-2xl border border-green-900 px-5 py-3 text-center font-semibold text-green-400 hover:bg-green-950"
                    >
                      Unsuspend
                    </button>
                  ) : (
                    <button
                      onClick={() => updateSuspensionStatus(user.id, true)}
                      className="rounded-2xl border border-red-900 px-5 py-3 text-center font-semibold text-red-400 hover:bg-red-950"
                    >
                      Suspend
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}