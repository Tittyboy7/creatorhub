"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
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
      setYoutube(creator.social_links?.youtube || "");
      setTiktok(creator.social_links?.tiktok || "");
      setInstagram(creator.social_links?.instagram || "");
      setShopify(creator.social_links?.shopify || "");
      setPatreon(creator.social_links?.patreon || "");
      setLoading(false);
    }

    loadProfile();
  }, [router]);

  async function handleUpdate(e) {
    e.preventDefault();

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
        username: username.trim().toLowerCase(),
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
    return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 w-full max-w-xl">
        <h1 className="text-4xl font-bold mb-8">Edit Creator Profile</h1>

        <Link
          href="/dashboard"
          className="inline-block mb-8 border border-zinc-700 px-5 py-3 rounded-2xl hover:bg-zinc-800"
        >
          Back to Dashboard
        </Link>

        <form onSubmit={handleUpdate} className="space-y-6">
          <input
            type="text"
            placeholder="Display Name"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />

          <input
            type="text"
            placeholder="Username"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="text"
            placeholder="Niche (e.g. Gaming, Art, Fitness)"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
          />

          <textarea
            placeholder="Bio"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4 h-40"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

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

          <input
            type="url"
            placeholder="YouTube URL"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
            value={youtube}
            onChange={(e) => setYoutube(e.target.value)}
          />

          <input
            type="url"
            placeholder="TikTok URL"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
            value={tiktok}
            onChange={(e) => setTiktok(e.target.value)}
          />

          <input
            type="url"
            placeholder="Instagram URL"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
          />

          <input
            type="url"
            placeholder="Shopify URL"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
            value={shopify}
            onChange={(e) => setShopify(e.target.value)}
          />

          <input
            type="url"
            placeholder="Patreon URL"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
            value={patreon}
            onChange={(e) => setPatreon(e.target.value)}
          />

          <button
            type="submit"
            className="w-full bg-white text-black py-4 rounded-2xl font-semibold"
          >
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
}