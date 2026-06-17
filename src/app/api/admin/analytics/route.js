import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export async function GET(request) {
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

    const { data: adminProfile } = await supabaseUserClient
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!adminProfile?.is_admin) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const currentMonth = getCurrentMonth();

    const [
      profilesResult,
      creatorsResult,
      productsResult,
      announcementsResult,
      revenueResult,
      verificationResult,
    ] = await Promise.all([
      supabaseAdmin.from("profiles").select("id, email, is_admin, is_suspended, created_at"),
      supabaseAdmin.from("creators").select("id, display_name, username, is_verified"),
      supabaseAdmin.from("products").select("id, title, is_active, created_at"),
      supabaseAdmin.from("announcements").select("id, title, is_active, admin_hidden, created_at"),
      supabaseAdmin.from("revenue_entries").select("id, amount, entry_month, created_at"),
      supabaseAdmin.from("verification_requests").select("id, status, created_at"),
    ]);

    const errors = [
      profilesResult.error,
      creatorsResult.error,
      productsResult.error,
      announcementsResult.error,
      revenueResult.error,
      verificationResult.error,
    ].filter(Boolean);

    if (errors.length > 0) {
      return NextResponse.json(
        { error: errors[0].message },
        { status: 500 }
      );
    }

    const profiles = profilesResult.data || [];
    const creators = creatorsResult.data || [];
    const products = productsResult.data || [];
    const announcements = announcementsResult.data || [];
    const revenueEntries = revenueResult.data || [];
    const verificationRequests = verificationResult.data || [];

    const recentActivity = [
      ...profiles.slice(0, 5).map((item) => ({
        id: `user-${item.id}`,
        type: "User",
        title: item.email || "New user",
        date: item.created_at,
        href: "/admin/users",
      })),
      ...products.slice(0, 5).map((item) => ({
        id: `product-${item.id}`,
        type: "Product",
        title: item.title || "New product",
        date: item.created_at,
        href: "/admin/products",
      })),
      ...verificationRequests.slice(0, 5).map((item) => ({
        id: `verification-${item.id}`,
        type: "Verification",
        title: `${item.status || "pending"} verification request`,
        date: item.created_at,
        href: "/admin/verification-requests",
      })),
    ]
      .filter((item) => item.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
    
    return NextResponse.json({
      analytics: {
        users: {
          total: profiles.length,
          admins: profiles.filter((profile) => profile.is_admin).length,
          suspended: profiles.filter((profile) => profile.is_suspended).length,
        },
        creators: {
          total: creators.length,
          verified: creators.filter((creator) => creator.is_verified).length,
          unverified: creators.filter((creator) => !creator.is_verified).length,
        },
        marketplace: {
          totalProducts: products.length,
          activeProducts: products.filter((product) => product.is_active).length,
          hiddenProducts: products.filter((product) => !product.is_active).length,
        },
        announcements: {
          total: announcements.length,
          active: announcements.filter((announcement) => announcement.is_active).length,
          hiddenByCreator: announcements.filter((announcement) => !announcement.is_active).length,
          hiddenByAdmin: announcements.filter((announcement) => announcement.admin_hidden).length,
        },
        revenue: {
          totalEntries: revenueEntries.length,
          entriesThisMonth: revenueEntries.filter(
            (entry) => entry.entry_month === currentMonth
          ).length,
          totalTrackedRevenue: revenueEntries.reduce(
            (sum, entry) => sum + Number(entry.amount || 0),
            0
          ),
        },
        requests: {
          totalVerificationRequests: verificationRequests.length,
          pendingVerificationRequests: verificationRequests.filter(
            (request) => request.status === "pending"
          ).length,
          approvedVerificationRequests: verificationRequests.filter(
            (request) => request.status === "approved"
          ).length,
          rejectedVerificationRequests: verificationRequests.filter(
            (request) => request.status === "rejected"
          ).length,
          revokedVerificationRequests: verificationRequests.filter(
            (request) => request.status === "revoked"
          ).length,
        },
        recentActivity,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Unexpected error." },
      { status: 500 }
    );
  }
}