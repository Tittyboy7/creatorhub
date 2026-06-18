import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    const supabaseUserClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseUserClient.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { data: currentProfile } = await supabaseUserClient
      .from("profiles")
      .select("is_admin, email")
      .eq("id", user.id)
      .single();

    if (!currentProfile?.is_admin) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const { userId, isSuspended, reason } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId." }, { status: 400 });
    }

    if (userId === user.id && isSuspended === true) {
      return NextResponse.json(
        { error: "You cannot suspend your own account." },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: targetProfile } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("id", userId)
      .maybeSingle();

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ is_suspended: isSuspended })
      .eq("id", userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabaseAdmin.from("notifications").insert({
      user_id: userId,
      type: "moderation",
      title: isSuspended ? "Account Suspended" : "Account Restored",
      message: isSuspended
        ? `Your account has been suspended. Reason: ${reason?.trim() || "No reason provided."}`
        : `Your account access has been restored. Reason: ${reason?.trim() || "No reason provided."}`,
    });

    await supabaseAdmin.from("audit_logs").insert({
      admin_id: user.id,
      action_type: isSuspended ? "Suspend User" : "Unsuspend User",
      target_type: "User",
      target_id: userId,
      reason: reason?.trim() || null,
      details: `${currentProfile.email || "Admin"} ${
        isSuspended ? "suspended" : "unsuspended"
      } ${targetProfile?.email || "a user"}.`,
    });

    return NextResponse.json({
      success: true,
      userId,
      isSuspended,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Unexpected error." },
      { status: 500 }
    );
  }
}