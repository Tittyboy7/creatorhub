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

    const { announcementId, adminHidden } = await request.json();

    if (!announcementId) {
      return NextResponse.json(
        { error: "Missing announcementId." },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: announcement } = await supabaseAdmin
      .from("announcements")
      .select("title")
      .eq("id", announcementId)
      .maybeSingle();

    const { error } = await supabaseAdmin
      .from("announcements")
      .update({ admin_hidden: adminHidden })
      .eq("id", announcementId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabaseAdmin.from("audit_logs").insert({
      admin_id: user.id,
      action_type: adminHidden ? "Hide Announcement" : "Restore Announcement",
      target_type: "Announcement",
      target_id: announcementId,
      details: `${profile.email || "Admin"} ${
        adminHidden ? "hid" : "restored"
      } announcement: ${announcement?.title || "Unknown announcement"}.`,
    });

    return NextResponse.json({
      success: true,
      announcementId,
      adminHidden,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Unexpected error." },
      { status: 500 }
    );
  }
}