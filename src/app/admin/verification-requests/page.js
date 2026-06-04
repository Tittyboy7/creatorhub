"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminVerificationRequestsPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("pending");

  async function loadRequests() {
    const { data, error } = await supabase
      .from("verification_requests")
      .select(`
        *,
        creators (
          id,
          display_name,
          username,
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

  useEffect(() => {
    loadRequests();
  }, []);

  async function handleApprove(request) {
    if (!request.creators?.id) return;

    const { error: creatorError } = await supabase
      .from("creators")
      .update({ is_verified: true })
      .eq("id", request.creators.id);

    if (creatorError) {
      alert(creatorError.message);
      return;
    }

    const { error: requestError } = await supabase
      .from("verification_requests")
      .update({ status: "approved" })
      .eq("id", request.id);

    if (requestError) {
      alert(requestError.message);
      return;
    }

    await loadRequests();
  }

  async function handleReject(request) {
    const { error } = await supabase
      .from("verification_requests")
      .update({ status: "rejected" })
      .eq("id", request.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadRequests();
  }

  const filteredRequests =
    statusFilter === "all"
      ? requests
      : requests.filter((request) => request.status === statusFilter);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-5 py-8 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold">
              Verification Requests
            </h1>

            <p className="text-zinc-400 mt-3">
              Review creator requests and approve verified status.
            </p>
          </div>

          <Link
            href="/admin"
            className="border border-zinc-700 px-5 py-3 rounded-2xl text-center hover:bg-zinc-800 transition"
          >
            Back to Admin
          </Link>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          {["pending", "approved", "rejected", "all"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-full border capitalize ${
                statusFilter === status
                  ? "bg-white text-black border-white"
                  : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {filteredRequests.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <p className="text-zinc-400">
              No {statusFilter === "all" ? "" : statusFilter} verification requests found.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {request.creators?.display_name || "Unknown creator"}
                    </h2>

                    {request.creators && (
                      <Link
                        href={`/creator/${request.creators.username}`}
                        className="text-zinc-400 hover:text-white"
                      >
                        @{request.creators.username}
                      </Link>
                    )}

                    <p className="text-zinc-500 mt-3">
                      Request status: {request.status}
                    </p>
                  </div>

                  <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm w-fit">
                    {request.creators?.is_verified ? "Verified" : "Not Verified"}
                  </span>
                </div>

                <p className="text-zinc-400 mt-6 whitespace-pre-wrap">
                  {request.message}
                </p>

                <div className="flex flex-wrap gap-3 mt-6">
                  <button
                    onClick={() => handleApprove(request)}
                    disabled={
                      request.status === "approved" ||
                      request.creators?.is_verified
                    }
                    className="bg-white text-black px-5 py-3 rounded-2xl font-semibold hover:bg-zinc-200 transition disabled:opacity-50"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => handleReject(request)}
                    disabled={request.status === "rejected"}
                    className="border border-zinc-700 px-5 py-3 rounded-2xl hover:bg-zinc-800 transition disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}