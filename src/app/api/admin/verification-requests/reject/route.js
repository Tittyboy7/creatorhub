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
    } = await supabaseUserClient.auth.getUser();

    const { data: profile } = await supabaseUserClient
      .from("profiles")
      .select("is_admin,email")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: "Forbidden." },
        { status: 403 }
      );
    }

    const { requestId } = await request.json();

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: verificationRequest } = await supabaseAdmin
      .from("verification_requests")
      .select(`
        id,
        creators (
          display_name,
          username
        )
      `)
      .eq("id", requestId)
      .single();

    const { error } = await supabaseAdmin
      .from("verification_requests")
      .update({
        status: "rejected",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    await supabaseAdmin.from("audit_logs").insert({
      admin_id: user.id,
      action_type: "Reject Verification Request",
      target_type: "Verification",
      target_id: requestId,
      details: `${profile.email} rejected verification for ${
        verificationRequest?.creators?.display_name ||
        verificationRequest?.creators?.username ||
        "creator"
      }.`,
    });

    return NextResponse.json({
      success: true,
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