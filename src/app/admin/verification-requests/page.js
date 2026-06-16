"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminVerificationRequestsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [requests, setRequests] = useState([]);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function loadRequests() {
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
        .from("verification_requests")
        .select(`
          *,
          creators (
            id,
            display_name,
            username,
            bio,
            niche,
            avatar_url,
            is_verified
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        alert(error.message);
      } else {
        setRequests(data || []);
      }

      setLoading(false);
    }

    loadRequests();
  }, [router]);

  async function handleApprove(request) {
    const creatorId = request.creator_id || request.creators?.id;

    if (!creatorId) {
      alert("Missing creator ID.");
      return;
    }

    setActionLoadingId(request.id);

    const { error: creatorError } = await supabase
      .from("creators")
      .update({ is_verified: true })
      .eq("id", creatorId);

    if (creatorError) {
      alert(creatorError.message);
      setActionLoadingId(null);
      return;
    }

    const { error: requestError } = await supabase
      .from("verification_requests")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", request.id);

    if (requestError) {
      alert(requestError.message);
      setActionLoadingId(null);
      return;
    }

    setRequests((currentRequests) =>
      currentRequests.map((currentRequest) =>
        currentRequest.id === request.id
          ? {
              ...currentRequest,
              status: "approved",
              reviewed_at: new Date().toISOString(),
              creators: {
                ...currentRequest.creators,
                is_verified: true,
              },
            }
          : currentRequest
      )
    );

    setActionLoadingId(null);
  }

  async function handleReject(request) {
    setActionLoadingId(request.id);

    const { error } = await supabase
      .from("verification_requests")
      .update({
        status: "rejected",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", request.id);

    if (error) {
      alert(error.message);
      setActionLoadingId(null);
      return;
    }

    setRequests((currentRequests) =>
      currentRequests.map((currentRequest) =>
        currentRequest.id === request.id
          ? {
              ...currentRequest,
              status: "rejected",
              reviewed_at: new Date().toISOString(),
            }
          : currentRequest
      )
    );

    setActionLoadingId(null);
  }

  async function handleRevoke(request) {
    const creatorId = request.creator_id || request.creators?.id;

    if (!creatorId) {
      alert("Missing creator ID.");
      return;
    }

    setActionLoadingId(request.id);

    const { error: creatorError } = await supabase
      .from("creators")
      .update({ is_verified: false })
      .eq("id", creatorId);

    if (creatorError) {
      alert(creatorError.message);
      setActionLoadingId(null);
      return;
    }

    const { error: requestError } = await supabase
      .from("verification_requests")
      .update({
        status: "revoked",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", request.id);

    if (requestError) {
      alert(requestError.message);
      setActionLoadingId(null);
      return;
    }

  setRequests((currentRequests) =>
    currentRequests.map((currentRequest) =>
      currentRequest.id === request.id
        ? {
            ...currentRequest,
            status: "revoked",
            reviewed_at: new Date().toISOString(),
            creators: {
              ...currentRequest.creators,
              is_verified: false,
            },
          }
        : currentRequest
    )
  );

  setActionLoadingId(null);
}

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        Loading...
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

  const pendingCount = requests.filter(
    (request) => request.status === "pending"
  ).length;

  const approvedCount = requests.filter(
    (request) => request.status === "approved"
  ).length;

  const rejectedCount = requests.filter(
    (request) => request.status === "rejected"
  ).length;

  const revokedCount = requests.filter(
    (request) => request.status === "revoked"
  ).length;

  const filteredRequests =
    statusFilter === "all"
      ? requests
      : requests.filter(
          (request) => request.status === statusFilter
        );

  return (
    <div className="min-h-screen bg-zinc-950 p-10 text-white">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/admin"
          className="inline-block rounded-2xl border border-zinc-700 px-5 py-3 hover:bg-zinc-800"
        >
          Back to Admin
        </Link>

        <section className="mt-6 rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Admin Review
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Verification Requests
          </h1>

          <p className="mt-3 max-w-3xl text-zinc-400">
            Review creator verification requests and approve trusted creators.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-sm text-zinc-500">Pending</p>
              <p className="mt-1 text-2xl font-bold">{pendingCount}</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-sm text-zinc-500">Approved</p>
              <p className="mt-1 text-2xl font-bold">{approvedCount}</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-sm text-zinc-500">Rejected</p>
              <p className="mt-1 text-2xl font-bold">{rejectedCount}</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-sm text-zinc-500">Revoked</p>
              <p className="mt-1 text-2xl font-bold">{revokedCount}</p>
            </div>
          </div>
        </section>

        <div className="mt-6 flex flex-wrap gap-3">
          {["all", "pending", "approved", "rejected", "revoked"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold capitalize ${
                statusFilter === status
                  ? "border-white bg-white text-black"
                  : "border-zinc-700 text-zinc-300 hover:border-white hover:text-white"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <section className="mt-6 space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center">
              <h2 className="text-2xl font-bold">No verification requests</h2>
              <p className="mt-2 text-zinc-400">
                New creator verification requests will appear here.
              </p>
            </div>
          ) : (
            filteredRequests.map((request) => {
              const creator = request.creators;
              const isActionLoading = actionLoadingId === request.id;

              return (
                <div
                  key={request.id}
                  className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex gap-4">
                      {creator?.avatar_url ? (
                        <img
                          src={creator.avatar_url}
                          alt={creator.display_name}
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-zinc-700" />
                      )}

                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-2xl font-bold">
                            {creator?.display_name || "Unknown Creator"}
                          </h2>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              request.status === "approved"
                                ? "bg-green-950 text-green-400"
                                : request.status === "rejected"
                                ? "bg-red-950 text-red-400"
                                : "bg-yellow-950 text-yellow-400"
                            }`}
                          >
                            {request.status || "pending"}
                          </span>
                        </div>

                        {creator?.username && (
                          <Link
                            href={`/creator/${creator.username}`}
                            className="mt-1 inline-block text-sm text-zinc-400 hover:text-white"
                          >
                            @{creator.username}
                          </Link>
                        )}

                        {creator?.niche && (
                          <p className="mt-2 text-sm text-zinc-500">
                            Niche: {creator.niche}
                          </p>
                        )}

                        {creator?.bio && (
                          <p className="mt-3 max-w-3xl text-sm text-zinc-400">
                            {creator.bio}
                          </p>
                        )}

                        {request.message && (
                          <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                            <p className="text-sm font-semibold text-zinc-300">
                              Request Message
                            </p>

                            <p className="mt-2 text-sm text-zinc-400">
                              {request.message}
                            </p>
                          </div>
                        )}

                        <div className="mt-4 flex flex-wrap gap-3 text-sm text-zinc-500">
                          <span>
                            Requested:{" "}
                            {request.created_at
                              ? new Date(request.created_at).toLocaleString()
                              : "Unknown"}
                          </span>

                          {request.reviewed_at && (
                            <span>
                              Reviewed:{" "}
                              {new Date(request.reviewed_at).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-3 lg:justify-end">
                      {request.status === "pending" ? (
                        <>
                          <button
                            onClick={() => handleApprove(request)}
                            disabled={isActionLoading}
                            className="rounded-2xl bg-white px-5 py-3 font-semibold text-black hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isActionLoading ? "Working..." : "Approve"}
                          </button>

                          <button
                            onClick={() => handleReject(request)}
                            disabled={isActionLoading}
                            className="rounded-2xl border border-red-900 px-5 py-3 font-semibold text-red-400 hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      ) : request.status === "approved" ? (
                        <button
                          onClick={() => handleRevoke(request)}
                          disabled={isActionLoading}
                          className="rounded-2xl border border-orange-800 px-5 py-3 font-semibold text-orange-400 hover:bg-orange-950"
                        >
                          Revoke Verification
                        </button>
                      ) : (
                        <p className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-3 text-sm font-semibold text-zinc-400">
                          Reviewed
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}