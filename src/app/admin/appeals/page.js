"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function formatDate(dateString) {
  if (!dateString) return "Unknown";
  return new Date(dateString).toLocaleString();
}

export default function AdminAppealsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [appeals, setAppeals] = useState([]);
  const [statusFilter, setStatusFilter] = useState("pending");

  useEffect(() => {
    async function loadAppeals() {
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
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);

      const { data, error } = await supabase
        .from("creator_appeals")
        .select(`
          *,
          creators (
            id,
            user_id,
            display_name,
            username,
            avatar_url
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        alert(error.message);
      } else {
        setAppeals(data || []);
      }

      setLoading(false);
    }

    loadAppeals();
  }, [router]);

  const filteredAppeals =
    statusFilter === "all"
      ? appeals
      : appeals.filter((appeal) => appeal.status === statusFilter);

  async function updateAppealStatus(appeal, status) {
    const reason = window.prompt(
      status === "approved"
        ? "Why are you approving this appeal?"
        : "Why are you denying this appeal?"
    );
  
    if (reason === null) return;
  
    if (!reason.trim()) {
      alert("Please enter a reason.");
      return;
    }
  
    const {
      data: { session },
    } = await supabase.auth.getSession();
  
    const response = await fetch("/api/admin/appeals/status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        appealId: appeal.id,
        status,
        reason: reason.trim(),
      }),
    });
 
    const data = await response.json();
 
    if (!response.ok) {
      alert(data.error || "Failed to update appeal.");
      return;
    }
 
    setAppeals((currentAppeals) =>
      currentAppeals.map((currentAppeal) =>
        currentAppeal.id === appeal.id
          ? { ...currentAppeal, status }
          : currentAppeal
      )
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        Loading appeals...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-zinc-950 p-10 text-white">
        <h1 className="text-4xl font-bold">Access denied</h1>
        <p className="mt-4 text-zinc-400">
          You do not have permission to view this page.
        </p>
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
            Suspension Review
          </p>

          <h1 className="mt-2 text-5xl font-bold">Creator Appeals</h1>

          <p className="mt-4 max-w-3xl text-zinc-400">
            Review suspension appeals from creators and decide whether to keep
            the suspension or restore access.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-sm text-zinc-500">Pending</p>
              <p className="mt-1 text-2xl font-bold">
                {appeals.filter((appeal) => appeal.status === "pending").length}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-sm text-zinc-500">Approved</p>
              <p className="mt-1 text-2xl font-bold">
                {appeals.filter((appeal) => appeal.status === "approved").length}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-sm text-zinc-500">Denied</p>
              <p className="mt-1 text-2xl font-bold">
                {appeals.filter((appeal) => appeal.status === "denied").length}
              </p>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          {["all", "pending", "approved", "denied"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold capitalize ${
                statusFilter === status
                  ? "border-white bg-white text-black"
                  : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <section className="space-y-4">
          {filteredAppeals.length === 0 ? (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center">
              <h2 className="text-2xl font-bold">No appeals found</h2>
              <p className="mt-2 text-zinc-400">
                Creator suspension appeals will appear here.
              </p>
            </div>
          ) : (
            filteredAppeals.map((appeal) => (
              <div
                key={appeal.id}
                className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-4">
                      {appeal.creators?.avatar_url ? (
                        <img
                          src={appeal.creators.avatar_url}
                          alt={appeal.creators.display_name}
                          className="h-14 w-14 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-full bg-zinc-700" />
                      )}

                      <div>
                        <h2 className="text-2xl font-bold">
                          {appeal.creators?.display_name || "Unknown Creator"}
                        </h2>

                        {appeal.creators?.username && (
                          <Link
                            href={`/admin/creators/${appeal.creators.id}`}
                            className="text-sm text-zinc-400 hover:text-white"
                          >
                            @{appeal.creators.username}
                          </Link>
                        )}
                      </div>
                    </div>

                    <span
                      className={`mt-4 inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                        appeal.status === "approved"
                          ? "bg-green-950 text-green-400"
                          : appeal.status === "denied"
                          ? "bg-red-950 text-red-400"
                          : "bg-yellow-950 text-yellow-400"
                      }`}
                    >
                      {appeal.status}
                    </span>

                    <p className="mt-4 whitespace-pre-wrap text-zinc-300">
                      {appeal.message}
                    </p>

                    <p className="mt-3 text-sm text-zinc-500">
                      Submitted: {formatDate(appeal.created_at)}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-3">
                    <Link
                      href={`/admin/creators/${appeal.creators?.id}`}
                      className="rounded-2xl border border-zinc-700 px-5 py-3 font-semibold text-zinc-300 hover:bg-zinc-800"
                    >
                      View Creator
                    </Link>

                    {appeal.status === "pending" && (
                      <>
                        <button
                          onClick={() => updateAppealStatus(appeal, "approved")}
                          className="rounded-2xl bg-white px-5 py-3 font-semibold text-black hover:bg-zinc-200"
                        >
                          Approve Appeal
                        </button>

                        <button
                          onClick={() => updateAppealStatus(appeal, "denied")}
                          className="rounded-2xl border border-red-900 px-5 py-3 font-semibold text-red-400 hover:bg-red-950"
                        >
                          Deny Appeal
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}