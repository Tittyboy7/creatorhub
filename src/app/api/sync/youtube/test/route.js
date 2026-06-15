import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getDateRange() {
  const now = new Date();

  const endYear = now.getFullYear();
  const endMonth = now.getMonth() + 1;

  const start = new Date(endYear, endMonth - 4, 1);

  const startYear = start.getFullYear();
  const startMonth = String(start.getMonth() + 1).padStart(2, "0");

  const endMonthString = String(endMonth).padStart(2, "0");

  return {
    startDate: `${startYear}-${startMonth}-01`,
    endDate: `${endYear}-${endMonthString}-01`,
  };
}

async function refreshGoogleAccessToken(refreshToken) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");

  if (!userId) {
    return NextResponse.json({ error: "Missing user_id." }, { status: 400 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: account, error: accountError } = await supabaseAdmin
    .from("connected_accounts")
    .select("*")
    .eq("user_id", userId)
    .eq("platform", "youtube")
    .single();

  if (accountError || !account) {
    return NextResponse.json(
      { error: "No connected YouTube account found." },
      { status: 404 }
    );
  }

  if (!account.refresh_token) {
    return NextResponse.json(
      { error: "No refresh token found. Reconnect YouTube." },
      { status: 400 }
    );
  }

  let freshTokenData;

  try {
    freshTokenData = await refreshGoogleAccessToken(account.refresh_token);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to refresh Google access token.",
        details: error.message,
      },
      { status: 500 }
    );
  }

  const freshAccessToken = freshTokenData.access_token;

  const expiresAt = new Date(
    Date.now() + Number(freshTokenData.expires_in || 3600) * 1000
  ).toISOString();

  await supabaseAdmin
    .from("connected_accounts")
    .update({
      access_token: freshAccessToken,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", account.id);

  const { startDate, endDate } = getDateRange();

  const params = new URLSearchParams({
    ids: "channel==MINE",
    startDate,
    endDate,
    metrics: "estimatedRevenue",
    dimensions: "month",
  });

  const youtubeResponse = await fetch(
    `https://youtubeanalytics.googleapis.com/v2/reports?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${freshAccessToken}`,
      },
    }
  );

  const youtubeData = await youtubeResponse.json();

  if (!youtubeResponse.ok) {
    return NextResponse.json(
      {
        error: "YouTube Analytics test sync failed.",
        details: youtubeData,
      },
      { status: youtubeResponse.status }
    );
  }

  return NextResponse.json({
    success: true,
    message: "YouTube Analytics connection works.",
    date_range: {
      startDate,
      endDate,
    },
    data: youtubeData,
  });
}