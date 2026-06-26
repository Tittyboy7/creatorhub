"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getAccentBadgeClass } from "@/lib/accentColors";
import SuspendedAccountMessage from "@/components/SuspendedAccountMessage";
import WorkspaceLayout from "@/components/workspace/WorkspaceLayout";

export default function EditProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [creatorId, setCreatorId] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [niche, setNiche] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [banner, setBanner] = useState(null);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState("");
  const [currentBannerUrl, setCurrentBannerUrl] = useState("");
  const [youtube, setYoutube] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [instagram, setInstagram] = useState("");
  const [shopify, setShopify] = useState("");
  const [patreon, setPatreon] = useState("");
  const [accentColor, setAccentColor] = useState("white");
  const [isSuspended, setIsSuspended] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_suspended")
        .eq("id", user.id)
        .single();

      if (profile?.is_suspended) {
        setIsSuspended(true);
        setLoading(false);
        return;
      }

      const { data: creator, error } = await supabase
        .from("creators")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error || !creator) {
        alert("Create a creator profile first.");
        router.push("/create-profile");
        return;
      }

      setCreatorId(creator.id);
      setDisplayName(creator.display_name || "");
      setUsername(creator.username || "");
      setNiche(creator.niche || "");
      setBio(creator.bio || "");
      setCurrentAvatarUrl(creator.avatar_url || "");
      setCurrentBannerUrl(creator.banner_url || "");
      setYoutube(creator.social_links?.youtube ?? "");
      setTiktok(creator.social_links?.tiktok ?? "");
      setInstagram(creator.social_links?.instagram ?? "");
      setShopify(creator.social_links?.shopify ?? "");
      setPatreon(creator.social_links?.patreon ?? "");
      setAccentColor(creator.accent_color ?? "white");
      setLoading(false);
    }

    loadProfile();
  }, [router]);

  async function handleUpdate(e) {
    e.preventDefault();

    const cleanUsername = username
      .trim()
      .toLowerCase();

    if (!/^[a-z0-9_-]+$/.test(cleanUsername)) {
      alert(
        "Username can only contain lowercase letters, numbers, underscores, and hyphens. No spaces."
      );
      return;
    }

    let avatarUrl = currentAvatarUrl;
    let bannerUrl = currentBannerUrl;

    if (avatar) {
      const avatarPath = `avatars/${Date.now()}-${avatar.name}`;

      const { error: avatarUploadError } = await supabase.storage
        .from("creator-images")
        .upload(avatarPath, avatar);

      if (avatarUploadError) {
        alert(avatarUploadError.message);
        return;
      }

      const { data } = supabase.storage
        .from("creator-images")
        .getPublicUrl(avatarPath);

      avatarUrl = data.publicUrl;
    }

    if (banner) {
      const bannerPath = `banners/${Date.now()}-${banner.name}`;

      const { error: bannerUploadError } = await supabase.storage
        .from("creator-images")
        .upload(bannerPath, banner);

      if (bannerUploadError) {
        alert(bannerUploadError.message);
        return;
      }

      const { data } = supabase.storage
        .from("creator-images")
        .getPublicUrl(bannerPath);

      bannerUrl = data.publicUrl;
    }

    const { error } = await supabase
      .from("creators")
      .update({
        display_name: displayName,
        username: cleanUsername,
        niche,
        bio,
        avatar_url: avatarUrl,
        banner_url: bannerUrl,
        social_links: {
          youtube,
          tiktok,
          instagram,
          shopify,
          patreon,
        },
        accent_color: accentColor,
      })
      .eq("id", creatorId);

    if (error) {
      alert(error.message);
    } else {
      alert("Profile updated!");
      router.push("/dashboard");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

    if (isSuspended) {
      return <SuspendedAccountMessage />;
    }

    return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-5xl space-y-6">
        <section className="rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Creator Workspace
          </p>

          <h1 className="mt-2 text-4xl font-bold">Manage your creator profile</h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">
            Update your public identity, storefront branding, social links, and creator presence.
          </p>
        </section>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 md:p-8">

        <Link
          href="/dashboard"
          className="inline-block mb-8 border border-zinc-700 px-5 py-3 rounded-2xl hover:bg-zinc-800"
        >
          Back to Dashboard
        </Link>

        <form onSubmit={handleUpdate} className="space-y-6">
          <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="mb-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Brand Identity
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                Control how your public creator profile appears across CreatorsHub.
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Display Name"
                className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 p-4"
                value={displayName || ""}
                onChange={(e) => setDisplayName(e.target.value)}
              />

              <input
                type="text"
                placeholder="Username"
                className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 p-4"
                value={username || ""}
                onChange={(e) => setUsername(e.target.value)}
              />

              <input
                type="text"
                placeholder="Niche (e.g. Gaming, Art, Fitness)"
                className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 p-4"
                value={niche || ""}
                onChange={(e) => setNiche(e.target.value)}
              />

              <textarea
                placeholder="Bio"
                className="h-40 w-full rounded-2xl border border-zinc-700 bg-zinc-800 p-4"
                value={bio || ""}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="mb-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Storefront Design
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                Customize how your public storefront feels to visitors.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-zinc-400">
                Storefront Accent Color
              </label>

              <select
                className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 p-4"
                value={accentColor || "white"}
                onChange={(e) => setAccentColor(e.target.value)}
              >
                <option value="white">White</option>
                <option value="blue">Blue</option>
                <option value="purple">Purple</option>
                <option value="green">Green</option>
                <option value="pink">Pink</option>
                <option value="orange">Orange</option>
                <option value="red">Red</option>
              </select>
            </div>

            <div className="mt-4 rounded-2xl border border-zinc-700 p-4">
              <p className="mb-3 text-zinc-400">Theme Preview</p>

              <span
                className={`inline-block rounded-full px-4 py-2 text-sm font-semibold ${getAccentBadgeClass(
                  accentColor || "white"
                )}`}
              >
                Featured Product
              </span>
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="mb-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Profile Media
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                Upload the avatar and banner visitors see on your public creator profile.
              </p>
            </div>

          {currentAvatarUrl && (
            <img
              src={currentAvatarUrl}
              alt="Current avatar"
              className="w-32 h-32 object-cover rounded-full mx-auto"
            />
          )}

          <input
            type="file"
            accept="image/*"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
            onChange={(e) => setAvatar(e.target.files[0])}
          />

          {currentBannerUrl && (
            <img
              src={currentBannerUrl}
              alt="Current banner"
              className="w-full h-40 object-cover rounded-2xl"
            />
          )}

          <input
            type="file"
            accept="image/*"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
            onChange={(e) => setBanner(e.target.files[0])}
          />
          </section>

          <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="mb-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Social Presence
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                Add the platforms where fans can find you outside of CreatorsHub.
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="url"
                placeholder="YouTube URL"
                className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 p-4"
                value={youtube || ""}
                onChange={(e) => setYoutube(e.target.value)}
              />

              <input
                type="url"
                placeholder="TikTok URL"
                className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 p-4"
                value={tiktok || ""}
                onChange={(e) => setTiktok(e.target.value)}
              />

              <input
                type="url"
                placeholder="Instagram URL"
                className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 p-4"
                value={instagram || ""}
                onChange={(e) => setInstagram(e.target.value)}
              />

              <input
                type="url"
                placeholder="Shopify URL"
                className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 p-4"
                value={shopify || ""}
                onChange={(e) => setShopify(e.target.value)}
              />

              <input
                type="url"
                placeholder="Patreon URL"
                className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 p-4"
                value={patreon || ""}
                onChange={(e) => setPatreon(e.target.value)}
              />
            </div>
          </section>

          <button
            type="submit"
            className="w-full rounded-2xl bg-white py-4 font-semibold text-black"
          >
            Save Profile
          </button>
        </form>
      </div>
    </div>
    </div>
  );
}