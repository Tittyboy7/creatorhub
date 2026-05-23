"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function FollowButton({ creatorId }) {
  const [user, setUser] = useState(null);
  const [followId, setFollowId] = useState(null);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    async function loadFollowData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      const { count } = await supabase
        .from("followers")
        .select("*", { count: "exact", head: true })
        .eq("creator_id", creatorId);

      setFollowerCount(count || 0);

      if (!user) return;

      const { data } = await supabase
        .from("followers")
        .select("id")
        .eq("user_id", user.id)
        .eq("creator_id", creatorId)
        .maybeSingle();

      if (data) {
        setFollowId(data.id);
      }
    }

    loadFollowData();
  }, [creatorId]);

  async function createFollowNotification() {
    const { data: creator } = await supabase
      .from("creators")
      .select("id, user_id")
      .eq("id", creatorId)
      .single();

    if (!creator?.user_id || creator.user_id === user.id) {
      return;
    }

    const { data: preferences } = await supabase
      .from("notification_preferences")
      .select("follows")
      .eq("user_id", creator.user_id)
      .maybeSingle();

    if (preferences?.follows !== false) {
      await supabase.from("notifications").insert({
        user_id: creator.user_id,
        creator_id: creator.id,
        title: "New Follower",
        message: "Someone followed your creator profile.",
      });
    }
  }

  async function toggleFollow() {
    if (!user) {
      alert("Please log in to follow creators.");
      return;
    }

    if (followId) {
      const { error } = await supabase
        .from("followers")
        .delete()
        .eq("id", followId);

      if (error) {
        alert(error.message);
        return;
      }

      setFollowId(null);
      setFollowerCount((count) => Math.max(count - 1, 0));
    } else {
      const { data, error } = await supabase
        .from("followers")
        .insert({
          user_id: user.id,
          creator_id: creatorId,
        })
        .select()
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      await createFollowNotification();

      setFollowId(data.id);
      setFollowerCount((count) => count + 1);
    }
  }

  return (
    <div className="flex items-center gap-4 mt-4">
      <button
        onClick={toggleFollow}
        className="bg-white text-black px-5 py-3 rounded-2xl font-semibold"
      >
        {followId ? "Following" : "Follow"}
      </button>

      <p className="text-zinc-400">
        {followerCount} followers
      </p>
    </div>
  );
}