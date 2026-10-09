import { NextRequest, NextResponse } from "next/server";
import { competitionEngine } from "@/lib/server/competitionEngine";
import { ChallengeId } from "@/types/arena";

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get("ras_session_id")?.value;
  if (!sessionId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  await competitionEngine.hydrateFromSupabaseAsync();
  let session = competitionEngine.getSession(sessionId);
  if (!session) {
    await competitionEngine.hydrateFromSupabaseAsync(true);
    session = competitionEngine.getSession(sessionId);
  }
  if (!session || session.status === "ELIMINATED") {
    return NextResponse.json({ success: false, error: "Invalid session" }, { status: 403 });
  }

  const { challengeId } = await req.json();
  const result = competitionEngine.requestHint(session.team_id, challengeId as ChallengeId);

  return NextResponse.json(result);
}
