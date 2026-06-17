"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function formatDate(dateString) {
  if (!dateString) return "Unknown";

  return new Date(dateString).toLocaleString();
}

export default function AdminAuditLogsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  useEffect(() => {
    async function loadLogs() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (!profile?.is_admin) {
        router.push("/admin");
        return;
      }

      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        alert(error.message);
      } else {
        setLogs(data || []);
      }

      setLoading(false);
    }

    loadLogs();
  }, [router]);

  const filteredLogs = logs.filter((log) => {
    const searchText = search.toLowerCase();

    const typeMatches =
      typeFilter === "All" || log.target_type === typeFilter;

    const searchMatches =
      log.action_type?.toLowerCase().includes(searchText) ||
      log.target_type?.toLowerCase().includes(searchText) ||
      log.details?.toLowerCase().includes(searchText) ||
      log.target_id?.toLowerCase().includes(searchText);

    return typeMatches && searchMatches;
  });

  const targetTypes = ["All", "User", "Creator", "Product", "Announcement", "Verification"];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        Loading audit logs...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-10 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <Link
          href="/admin"
          className="inline-block rounded-2xl border border-zinc-700 px-5 py-3 hover:bg-zinc-800"
        >
          Back to Admin
        </Link>

        <section className="rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Admin History
          </p>

          <h1 className="mt-2 text-5xl font-bold">Audit Logs</h1>

          <p className="mt-4 max-w-3xl text-zinc-400">
            Track moderation and admin actions across users, creators, products,
            announcements, and verification requests.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-sm text-zinc-500">Total Logs</p>
              <p className="mt-1 text-2xl font-bold">{logs.length}</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-sm text-zinc-500">Filtered Logs</p>
              <p className="mt-1 text-2xl font-bold">{filteredLogs.length}</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-sm text-zinc-500">Latest Action</p>
              <p className="mt-1 line-clamp-1 text-2xl font-bold">
                {logs[0]?.action_type || "None"}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
            <input
              type="text"
              placeholder="Search actions, details, target IDs..."
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 outline-none focus:border-zinc-600"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 outline-none focus:border-zinc-600"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              {targetTypes.map((type) => (
                <option key={type} value={type}>
                  {type === "All" ? "All Target Types" : type}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {targetTypes.map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                  typeFilter === type
                    ? "border-white bg-white text-black"
                    : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                {type}
              </button>
            ))}

            {(search || typeFilter !== "All") && (
              <button
                onClick={() => {
                  setSearch("");
                  setTypeFilter("All");
                }}
                className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 hover:bg-zinc-800"
              >
                Clear
              </button>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-5">
            <h2 className="text-2xl font-bold">Timeline</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Showing {filteredLogs.length} audit log
              {filteredLogs.length === 1 ? "" : "s"}.
            </p>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center">
              <h3 className="text-xl font-bold">No audit logs found</h3>
              <p className="mt-2 text-zinc-400">
                Admin actions will appear here once logging is connected.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-300">
                          {log.target_type}
                        </span>

                        <h3 className="text-lg font-bold">
                          {log.action_type}
                        </h3>
                      </div>

                      {log.details && (
                        <p className="mt-3 text-sm text-zinc-400">
                          {log.details}
                        </p>
                      )}

                      {log.target_id && (
                        <p className="mt-2 text-xs text-zinc-600">
                          Target ID: {log.target_id}
                        </p>
                      )}

                      {log.admin_id && (
                        <p className="mt-1 text-xs text-zinc-600">
                          Admin ID: {log.admin_id}
                        </p>
                      )}
                    </div>

                    <p className="shrink-0 text-sm text-zinc-500">
                      {formatDate(log.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}