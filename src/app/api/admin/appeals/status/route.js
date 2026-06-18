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

    const { data: profile } = await supabaseUserClient
      .from("profiles")
      .select("is_admin, email")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const { appealId, status, reason } = await request.json();

    if (!appealId) {
      return NextResponse.json({ error: "Missing appealId." }, { status: 400 });
    }

    if (!["approved", "denied"].includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: appeal } = await supabaseAdmin
      .from("creator_appeals")
      .select(`
        id,
        creator_id,
        creators (
          id,
          user_id,
          display_name,
          username
        )
      `)
      .eq("id", appealId)
      .maybeSingle();

    if (!appeal) {
      return NextResponse.json({ error: "Appeal not found." }, { status: 404 });
    }

    const { error: appealError } = await supabaseAdmin
      .from("creator_appeals")
      .update({ status })
      .eq("id", appealId);

    if (appealError) {
      return NextResponse.json({ error: appealError.message }, { status: 500 });
    }

    if (status === "approved" && appeal.creators?.user_id) {
      const { error: unsuspendError } = await supabaseAdmin
        .from("profiles")
        .update({ is_suspended: false })
        .eq("id", appeal.creators.user_id);

      if (unsuspendError) {
        return NextResponse.json(
          { error: unsuspendError.message },
          { status: 500 }
        );
      }
    }

    if (appeal.creators?.user_id) {
      await supabaseAdmin.from("notifications").insert({
        user_id: appeal.creators.user_id,
        type: "appeal",
        title: status === "approved" ? "Appeal Approved" : "Appeal Denied",
        message:
          status === "approved"
            ? `Your appeal was approved and your account access has been restored. Reason: ${reason?.trim() || "No reason provided."}`
            : `Your appeal was denied. Reason: ${reason?.trim() || "No reason provided."}`,
      });
    }

    await supabaseAdmin.from("audit_logs").insert({
      admin_id: user.id,
      action_type:
        status === "approved" ? "Approve Appeal" : "Deny Appeal",
      target_type: "Creator",
      target_id: appeal.creator_id,
      reason: reason?.trim() || null,
      details: `${profile.email || "Admin"} ${
        status === "approved" ? "approved" : "denied"
      } appeal for ${
        appeal.creators?.display_name ||
        appeal.creators?.username ||
        "a creator"
      }.`,
    });

    return NextResponse.json({
      success: true,
      appealId,
      status,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Unexpected error." },
      { status: 500 }
    );
  }
}