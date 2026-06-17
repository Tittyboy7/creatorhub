import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
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
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const { data: profile } = await supabaseUserClient
      .from("profiles")
      .select("is_admin, email")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: "Forbidden." },
        { status: 403 }
      );
    }

    const { creatorId, verified } = await request.json();

    if (!creatorId) {
      return NextResponse.json(
        { error: "Missing creatorId." },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: creator } = await supabaseAdmin
      .from("creators")
      .select("display_name, username")
      .eq("id", creatorId)
      .maybeSingle();

    const { error } = await supabaseAdmin
      .from("creators")
      .update({
        is_verified: verified,
      })
      .eq("id", creatorId);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    await supabaseAdmin.from("audit_logs").insert({
      admin_id: user.id,
      action_type: verified ? "Verify Creator" : "Revoke Creator Verification",
      target_type: "Creator",
      target_id: creatorId,
      details: `${profile.email || "Admin"} ${
        verified ? "verified" : "revoked verification for"
      } ${creator?.display_name || creator?.username || "a creator"}.`,
    });

    return NextResponse.json({
      success: true,
      verified,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message || "Unexpected error.",
      },
      { status: 500 }
    );
  }
}