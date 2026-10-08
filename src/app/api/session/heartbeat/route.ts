import { NextRequest, NextResponse } from "next/server";
import { competitionEngine } from "@/lib/server/competitionEngine";

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get("ras_session_id")?.value;
  if (!sessionId) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  const { currentRoute } = await req.json().catch(() => ({ currentRoute: "/arena" }));
  const result = competitionEngine.heartbeat(sessionId, currentRoute || "/arena");

  return NextResponse.json(result);
}
