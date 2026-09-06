import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase =
    await createSupabaseServerClient();

  const {
    data: {
      user,
    },
    error: userError,
  } =
    await supabase.auth.getUser();

  if (
    userError ||
    !user
  ) {
    return NextResponse.json(
      {
        error:
          "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "creator_preferences"
      )
      .select(
        "platform_hub"
      )
      .eq(
        "user_id",
        user.id
      )
      .maybeSingle();

  if (error) {
    return NextResponse.json(
      {
        error:
          error.message,
      },
      {
        status: 500,
      }
    );
  }

  return NextResponse.json({
    platformHub:
      data?.platform_hub ||
      {},
  });
}

export async function PUT(
  request
) {
  const supabase =
    await createSupabaseServerClient();

  const {
    data: {
      user,
    },
    error: userError,
  } =
    await supabase.auth.getUser();

  if (
    userError ||
    !user
  ) {
    return NextResponse.json(
      {
        error:
          "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  let body;

  try {
    body =
      await request.json();
  } catch {
    return NextResponse.json(
      {
        error:
          "Invalid JSON body",
      },
      {
        status: 400,
      }
    );
  }

  const platformKey =
    body?.platformKey;

  const metricKeys =
    body?.metricKeys;

  if (
    typeof platformKey !==
      "string" ||
    !platformKey.trim() ||
    !Array.isArray(
      metricKeys
    ) ||
    metricKeys.length !== 4 ||
    metricKeys.some(
      (metricKey) =>
        typeof metricKey !==
          "string" ||
        !metricKey.trim()
    )
  ) {
    return NextResponse.json(
      {
        error:
          "Invalid metric preference",
      },
      {
        status: 400,
      }
    );
  }

  const {
    data:
      existingPreference,
    error:
      existingPreferenceError,
  } =
    await supabase
      .from(
        "creator_preferences"
      )
      .select(
        "platform_hub"
      )
      .eq(
        "user_id",
        user.id
      )
      .maybeSingle();

  if (
    existingPreferenceError
  ) {
    return NextResponse.json(
      {
        error:
          existingPreferenceError
            .message,
      },
      {
        status: 500,
      }
    );
  }

  const existingPlatformHub =
    existingPreference
      ?.platform_hub &&
    typeof existingPreference
      .platform_hub ===
      "object"
      ? existingPreference
          .platform_hub
      : {};

  const existingMetricSelections =
    existingPlatformHub
      ?.metricSelections &&
    typeof existingPlatformHub
      .metricSelections ===
      "object"
      ? existingPlatformHub
          .metricSelections
      : {};

  const nextPlatformHub = {
    ...existingPlatformHub,

    metricSelections: {
      ...existingMetricSelections,

      [platformKey]:
        metricKeys,
    },
  };

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "creator_preferences"
      )
      .upsert(
        {
          user_id:
            user.id,

          platform_hub:
            nextPlatformHub,

          updated_at:
            new Date()
              .toISOString(),
        },
        {
          onConflict:
            "user_id",
        }
      )
      .select(
        "platform_hub"
      )
      .single();

  if (error) {
    return NextResponse.json(
      {
        error:
          error.message,
      },
      {
        status: 500,
      }
    );
  }

  return NextResponse.json({
    platformHub:
      data.platform_hub,
  });
}