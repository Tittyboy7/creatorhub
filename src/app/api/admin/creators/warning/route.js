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

    const { creatorId, reason, severity } = await request.json();

    if (!creatorId) {
      return NextResponse.json({ error: "Missing creatorId." }, { status: 400 });
    }

    if (!reason?.trim()) {
      return NextResponse.json({ error: "Missing warning reason." }, { status: 400 });
    }

    const cleanSeverity = severity || "warning";

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: creator } = await supabaseAdmin
      .from("creators")
      .select("display_name, username, user_id")
      .eq("id", creatorId)
      .maybeSingle();

    const { error: warningError } = await supabaseAdmin
      .from("creator_warnings")
      .insert({
        creator_id: creatorId,
        admin_id: user.id,
        reason: reason.trim(),
        severity: cleanSeverity,
      });

      if (warningError) {
      return NextResponse.json({ error: warningError.message }, { status: 500 });
    }

      if (creator?.user_id) {
        await supabaseAdmin.from("notifications").insert({
          user_id: creator.user_id,
          type: "warning",
          title: "Creator Warning",
          message: `Your creator profile received a warning. Reason: ${reason.trim()}`,
        });
      }

    await supabaseAdmin.from("audit_logs").insert({
      admin_id: user.id,
      action_type: "Warn Creator",
      target_type: "Creator",
      target_id: creatorId,
      reason: reason.trim(),
      severity: cleanSeverity,
      details: `${profile.email || "Admin"} warned ${
        creator?.display_name || creator?.username || "a creator"
      }. Severity: ${cleanSeverity.toUpperCase()}.`,
    });

    return NextResponse.json({
      success: true,
      creatorId,
      severity: cleanSeverity,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Unexpected error." },
      { status: 500 }
    );
  }
}