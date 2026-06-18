"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminSingleCreatorPage() {
  const params = useParams();
  const router = useRouter();
  const creatorId = params?.id;

  const [loading, setLoading] = useState(true);
  const [creator, setCreator] = useState(null);
  const [email, setEmail] = useState("Email unavailable");
  const [actionLoading, setActionLoading] = useState(false);
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    async function loadCreator() {
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
        .from("creators")
        .select(`
          *,
          products (
            id,
            title,
            price,
            is_active
          ),
          followers (
            id
          )
        `)
        .eq("id", creatorId)
        .single();

      if (error || !data) {
        alert(error?.message || "Creator not found.");
        router.push("/admin/creators");
        return;
      }

      setCreator(data);

      const { data: warningData } = await supabase
        .from("creator_warnings")
        .select("*")
        .eq("creator_id", creatorId)
        .order("created_at", { ascending: false });

      setWarnings(warningData || []);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const profileResponse = await fetch("/api/admin/profile-emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ userIds: [data.user_id] }),
      });

      const profileData = await profileResponse.json();
      setEmail(profileData.profiles?.[0]?.email || "Email unavailable");

      setLoading(false);
    }

    loadCreator();
  }, [creatorId, router]);

  async function updateVerification(verified) {
    if (!creator?.id) {
      alert("Creator has not loaded yet.");
      return;
    }

    setActionLoading(true);

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
        creatorId: creator?.id,
        verified,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Failed to update verification.");
      setActionLoading(false);
      return;
    }

    setCreator((current) => ({
      ...current,
      is_verified: verified,
    }));

    setActionLoading(false);
  }

  async function updateProductStatus(productId, isActive) {
    const reason = window.prompt(
      isActive
        ? "Why are you restoring this product?"
        : "Why are you hiding this product?"
    );

    if (reason === null) return;

    if (!reason.trim()) {
      alert("Please enter a reason.");
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const response = await fetch("/api/admin/products/status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        productId,
        isActive,
        reason: reason.trim(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Failed to update product.");
      return;
    }

    setCreator((current) => ({
      ...current,
      products: (current.products || []).map((product) =>
        product.id === productId
          ? { ...product, is_active: isActive }
          : product
      ),
    }));
  }

  async function warnCreator() {
    if (!creator?.id) {
      alert("Creator has not loaded yet.");
      return;
    }

    const reason = window.prompt("Why are you warning this creator?");

    if (reason === null) return;

    if (!reason.trim()) {
      alert("Please enter a warning reason.");
      return;
    }

    const severity = window.prompt(
      "Severity? Type: warning, serious, or final",
      "warning"
    );

    if (severity === null) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const response = await fetch("/api/admin/creators/warning", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        creatorId: creator.id,
        reason: reason.trim(),
        severity: severity.trim() || "warning",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Failed to warn creator.");
      return;
    }

    alert("Creator warning saved.");
  }

  async function suspendCreatorUser() {
    if (!creator?.user_id) {
      alert("User not found.");
      return;
    }

    const reason = window.prompt(
      "Why are you suspending this creator?"
    );

    if (reason === null) return;

    if (!reason.trim()) {
      alert("Please enter a suspension reason.");
      return;
    }

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
        userId: creator.user_id,
        isSuspended: true,
        reason: reason.trim(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Failed to suspend creator.");
      return;
    }

    alert("Creator account suspended.");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        Loading creator...
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-zinc-950 p-10 text-white">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/admin/creators"
            className="inline-block rounded-2xl border border-zinc-700 px-5 py-3 hover:bg-zinc-800"
          >
            Back to Admin Creators
          </Link>
 
          <h1 className="mt-8 text-4xl font-bold">Creator not found</h1>
 
          <p className="mt-3 text-zinc-400">
            This creator could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-10 text-white">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/admin/creators"
          className="inline-block rounded-2xl border border-zinc-700 px-5 py-3 hover:bg-zinc-800"
        >
          Back to Admin Creators
        </Link>

        <section className="mt-6 overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-900">
          {creator.banner_url ? (
            <img
              src={creator.banner_url}
              alt={creator.display_name}
              className="h-48 w-full object-cover"
            />
          ) : (
            <div className="h-48 bg-zinc-800" />
          )}

          <div className="p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                {creator.avatar_url ? (
                  <img
                    src={creator.avatar_url}
                    alt={creator.display_name}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-zinc-700" />
                )}

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-4xl font-bold">
                      {creator.display_name}
                    </h1>

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
                  <p className="mt-1 text-sm text-zinc-500">Email: {email}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/creator/${creator.username}`}
                  className="rounded-2xl bg-white px-5 py-3 font-semibold text-black hover:bg-zinc-200"
                >
                  View Storefront
                </Link>

                {creator.is_verified ? (
                  <button
                    onClick={() => updateVerification(false)}
                    disabled={actionLoading}
                    className="rounded-2xl border border-orange-800 px-5 py-3 font-semibold text-orange-400 hover:bg-orange-950 disabled:opacity-50"
                  >
                    {actionLoading ? "Working..." : "Revoke Verification"}
                  </button>
                ) : (
                  <button
                    onClick={() => updateVerification(true)}
                    disabled={actionLoading}
                    className="rounded-2xl border border-green-900 px-5 py-3 font-semibold text-green-400 hover:bg-green-950 disabled:opacity-50"
                  >
                    {actionLoading ? "Working..." : "Verify Creator"}
                  </button>
                )}

                <button
                  onClick={warnCreator}
                  className="rounded-2xl border border-yellow-900 px-5 py-3 font-semibold text-yellow-400 hover:bg-yellow-950"
                >
                  Warn Creator
                </button>

                {warnings.length >= 3 && (
                  <button
                    onClick={suspendCreatorUser}
                    className="rounded-2xl border border-red-900 px-5 py-3 font-semibold text-red-400 hover:bg-red-950"
                  >
                    Suspend User
                  </button>
                )}
              </div>
            </div>

            {creator.niche && (
              <p className="mt-6 text-zinc-400">Niche: {creator.niche}</p>
            )}

            {creator.bio && (
              <p className="mt-3 max-w-3xl text-zinc-400">{creator.bio}</p>
            )}
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-5">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-500">Products</p>
            <p className="mt-1 text-3xl font-bold">
              {(creator.products || []).length}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-500">Followers</p>
            <p className="mt-1 text-3xl font-bold">
              {(creator.followers || []).length}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-500">Active Products</p>
            <p className="mt-1 text-3xl font-bold">
              {(creator.products || []).filter((product) => product.is_active)
                .length}
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-900 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-500">Warnings</p>

            <p className="mt-1 text-3xl font-bold text-yellow-400">
              {warnings.length}
            </p>
          </div>

          <div
            className={`rounded-2xl border p-5 ${
              warnings.length >= 3
                ? "border-red-900 bg-red-950/20"
                : warnings.length === 2
                ? "border-orange-900 bg-orange-950/20"
                : "border-zinc-800 bg-zinc-900"
            }`}
          >
            <p className="text-sm text-zinc-500">Escalation Status</p>

            <p
              className={`mt-1 text-xl font-bold ${
                warnings.length >= 3
                  ? "text-red-400"
                  : warnings.length === 2
                  ? "text-orange-400"
                  : "text-zinc-300"
              }`}
            >
              {warnings.length >= 3
                ? "Recommend Suspension"
                : warnings.length === 2
                ? "Serious Review"
                : "Normal"}
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-2xl font-bold">Products</h2>

          {(creator.products || []).length === 0 ? (
            <p className="mt-3 text-zinc-400">No products found.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {creator.products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
                >
                  <div>
                    <p className="font-semibold">{product.title}</p>
                    <p className="text-sm text-zinc-500">
                      ${Number(product.price || 0).toFixed(2)} ·{" "}
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          product.is_active
                            ? "bg-green-950 text-green-400"
                            : "bg-red-950 text-red-400"
                        }`}
                      >
                        {product.is_active ? "Active" : "Inactive"}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/product/${product.id}`}
                      className="text-sm font-semibold text-zinc-300 hover:text-white"
                    >
                      View
                    </Link>

                    {product.is_active ? (
                      <button
                        onClick={() => updateProductStatus(product.id, false)}
                        className="rounded-xl border border-red-900 px-3 py-2 text-sm font-semibold text-red-400 hover:bg-red-950"
                      >
                        Hide
                      </button>
                    ) : (
                      <button
                        onClick={() => updateProductStatus(product.id, true)}
                        className="rounded-xl border border-green-900 px-3 py-2 text-sm font-semibold text-green-400 hover:bg-green-950"
                      >
                        Restore
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-2xl font-bold">Warning History</h2>

          {warnings.length === 0 ? (
            <p className="mt-4 text-zinc-400">
              No warnings have been issued.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {warnings.map((warning) => (
                <div
                  key={warning.id}
                  className="rounded-2xl border border-yellow-900 bg-zinc-950 p-4"
                >
                  <p className="text-yellow-400 font-semibold">
                    {warning.severity?.toUpperCase() || "WARNING"}
                  </p>

                  <p className="mt-2 text-zinc-300">
                    {warning.reason}
                  </p>

                  <p className="mt-2 text-xs text-zinc-500">
                    {new Date(warning.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}