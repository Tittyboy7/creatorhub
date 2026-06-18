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

    const { productId, isFlagged, reason } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: "Missing productId." }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: product } = await supabaseAdmin
      .from("products")
      .select("title")
      .eq("id", productId)
      .maybeSingle();

    const { error: productError } = await supabaseAdmin
      .from("products")
      .update({ is_flagged: isFlagged })
      .eq("id", productId);

    if (productError) {
      return NextResponse.json({ error: productError.message }, { status: 500 });
    }

    if (isFlagged) {
      await supabaseAdmin.from("product_flags").insert({
        product_id: productId,
        admin_id: user.id,
        reason: reason?.trim() || null,
      });
    }

    await supabaseAdmin.from("audit_logs").insert({
      admin_id: user.id,
      action_type: isFlagged ? "Flag Product" : "Unflag Product",
      target_type: "Product",
      target_id: productId,
      reason: reason?.trim() || null,
      details: `${profile.email || "Admin"} ${
        isFlagged ? "flagged" : "unflagged"
      } product: ${product?.title || "Unknown product"}.`,
    });

    return NextResponse.json({
      success: true,
      productId,
      isFlagged,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Unexpected error." },
      { status: 500 }
    );
  }
}