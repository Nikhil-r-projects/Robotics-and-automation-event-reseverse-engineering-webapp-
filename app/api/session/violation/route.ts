import { NextRequest, NextResponse } from "next/server";
import { competitionEngine } from "@/lib/server/competitionEngine";

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get("ras_session_id")?.value;
  if (!sessionId) {
    return NextResponse.json({ success: false, error: "No session" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const type = body.type || "TAB_HIDDEN";
  const metadata = body.metadata || {};

  await competitionEngine.hydrateFromSupabaseAsync();
  const result = competitionEngine.registerViolation(sessionId, type, metadata);

  return NextResponse.json({
    success: true,
    eliminated: true,
    violation: result.violation,
  });
}
