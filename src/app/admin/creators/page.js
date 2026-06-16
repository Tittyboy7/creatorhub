"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminCreatorsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [creators, setCreators] = useState([]);
  const [search, setSearch] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    async function loadCreators() {
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
        .from("creators")
        .select(`
          *,
          products (
            id
          ),
          followers (
            id
          )
        `)
        .order("display_name", { ascending: true });

      if (error) {
        alert(error.message);
      } else {
        const userIds = [
          ...new Set((data || []).map((creator) => creator.user_id).filter(Boolean)),
        ];

        const {
          data: { session },
        } = await supabase.auth.getSession();

        const profileResponse = await fetch("/api/admin/profile-emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ userIds }),
        });

        const profileData = await profileResponse.json();

        const profilesById = Object.fromEntries(
          (profileData.profiles || []).map((profile) => [profile.id, profile])
        );

        const creatorsWithEmails = (data || []).map((creator) => ({
          ...creator,
          requester_email:
            profilesById[creator.user_id]?.email || "Email unavailable",
        }));

        setCreators(creatorsWithEmails);
      }

      setLoading(false);
    }

    loadCreators();
  }, [router]);

  async function handleVerifyCreator(creator) {
    setActionLoadingId(creator.id);

    const {
      data: { session },
    } = await supabase.auth.getSession();
 
    const response = await fetch("/api/admin/creators/verification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        creatorId: creator.id,
        verified: true,
      }),
    });
 
    const data = await response.json();
 
    if (!response.ok) {
      alert(data.error || "Failed to verify creator.");
      setActionLoadingId(null);
      return;
    }

  setCreators((currentCreators) =>
    currentCreators.map((currentCreator) =>
      currentCreator.id === creator.id
        ? { ...currentCreator, is_verified: true }
        : currentCreator
    )
  );

  setActionLoadingId(null);
}

  async function handleRevokeCreator(creator) {
    const confirmed = confirm(
      `Are you sure you want to revoke verification for ${creator.display_name}?`
    );
 
    if (!confirmed) return;
 
    setActionLoadingId(creator.id);
 
    const {
      data: { session },
    } = await supabase.auth.getSession();
 
    const response = await fetch("/api/admin/creators/verification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        creatorId: creator.id,
        verified: false,
      }),
    });
 
    const data = await response.json();
 
    if (!response.ok) {
      alert(data.error || "Failed to revoke verification.");
      setActionLoadingId(null);
      return;
    }

  setCreators((currentCreators) =>
    currentCreators.map((currentCreator) =>
      currentCreator.id === creator.id
        ? { ...currentCreator, is_verified: false }
        : currentCreator
    )
  );

  setActionLoadingId(null);
}

  const filteredCreators = creators.filter((creator) => {
    const searchText = search.toLowerCase();

    return (
      creator.display_name?.toLowerCase().includes(searchText) ||
      creator.username?.toLowerCase().includes(searchText) ||
      creator.niche?.toLowerCase().includes(searchText) ||
      creator.requester_email?.toLowerCase().includes(searchText)
    );
  });

  const verifiedCount = creators.filter((creator) => creator.is_verified).length;
  const unverifiedCount = creators.length - verifiedCount;

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

  return (
    <div className="min-h-screen bg-zinc-950 p-10 text-white">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/admin"
          className="mb-8 inline-block rounded-2xl border border-zinc-700 px-5 py-3 hover:bg-zinc-800"
        >
          Back to Admin
        </Link>

        <section className="rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Admin Management
          </p>

          <h1 className="mt-2 text-4xl font-bold">Admin Creators</h1>

          <p className="mt-3 max-w-3xl text-zinc-400">
            Review creator profiles, storefronts, verification status, and account information.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-sm text-zinc-500">Creators</p>
              <p className="mt-1 text-2xl font-bold">{creators.length}</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-sm text-zinc-500">Verified</p>
              <p className="mt-1 text-2xl font-bold">{verifiedCount}</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-sm text-zinc-500">Unverified</p>
              <p className="mt-1 text-2xl font-bold">{unverifiedCount}</p>
            </div>
          </div>
        </section>

        <input
          type="text"
          placeholder="Search creators by name, username, niche, or email..."
          className="mt-6 mb-6 w-full rounded-2xl border border-zinc-700 bg-zinc-900 p-4 outline-none focus:border-zinc-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <p className="mb-6 text-zinc-400">
          Showing {filteredCreators.length} creator
          {filteredCreators.length === 1 ? "" : "s"}
        </p>

        {filteredCreators.length === 0 ? (
          <p className="text-zinc-400">No creators found.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredCreators.map((creator) => {
              const isActionLoading = actionLoadingId === creator.id;

              return (
                <div
                  key={creator.id}
                  className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900"
                >
                  {creator.banner_url ? (
                    <img
                      src={creator.banner_url}
                      alt={creator.display_name}
                      className="h-32 w-full object-cover"
                    />
                  ) : (
                    <div className="h-32 bg-zinc-800" />
                  )}

                  <div className="p-6">
                    {creator.avatar_url ? (
                      <img
                        src={creator.avatar_url}
                        alt={creator.display_name}
                        className="-mt-16 mb-4 h-20 w-20 rounded-full border-4 border-zinc-900 object-cover"
                      />
                    ) : (
                      <div className="-mt-16 mb-4 h-20 w-20 rounded-full border-4 border-zinc-900 bg-zinc-700" />
                    )}

                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-semibold">
                        {creator.display_name}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          creator.is_verified
                            ? "bg-green-950 text-green-400"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {creator.is_verified ? "Verified" : "Unverified"}
                      </span>
                    </div>

                    <p className="mt-1 text-zinc-400">@{creator.username}</p>

                    <p className="mt-2 text-sm text-zinc-500">
                      Email:{" "}
                      <span className="text-zinc-300">
                        {creator.requester_email}
                      </span>
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2 text-sm text-zinc-500">
                      <span>
                        {(creator.products || []).length} product
                        {(creator.products || []).length === 1 ? "" : "s"}
                      </span>

                      <span>•</span>

                      <span>
                        {(creator.followers || []).length} follower
                        {(creator.followers || []).length === 1 ? "" : "s"}
                      </span>
                    </div>

                    {creator.niche && (
                      <span className="mt-3 inline-block rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-300">
                        {creator.niche}
                      </span>
                    )}

                    {creator.bio && (
                      <p className="mt-4 line-clamp-3 text-zinc-400">
                        {creator.bio}
                      </p>
                    )}

                    <div className="mt-5 space-y-3">
                      <Link
                        href={`/creator/${creator.username}`}
                        className="flex w-full items-center justify-center rounded-2xl bg-white py-3 font-semibold text-black hover:bg-zinc-200"
                      >
                        View Storefront
                      </Link>

                      {creator.is_verified ? (
                        <button
                          onClick={() => handleRevokeCreator(creator)}
                          disabled={isActionLoading}
                          className="w-full rounded-2xl border border-orange-800 px-5 py-3 font-semibold text-orange-400 hover:bg-orange-950 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isActionLoading ? "Working..." : "Revoke Verification"}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleVerifyCreator(creator)}
                          disabled={isActionLoading}
                          className="w-full rounded-2xl border border-green-900 px-5 py-3 font-semibold text-green-400 hover:bg-green-950 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isActionLoading ? "Working..." : "Verify Creator"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}