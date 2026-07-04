import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();

    return NextResponse.json({
      ok: true,
      provider: "mock",
      message: "AI analyze route is connected.",
      received: {
        skillName: body?.skillName || null,
        hasContext: Boolean(body?.context),
      },
    });
  } catch (error) {
    console.error("AI analyze route error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Failed to analyze AI request.",
      },
      { status: 500 }
    );
  }
}