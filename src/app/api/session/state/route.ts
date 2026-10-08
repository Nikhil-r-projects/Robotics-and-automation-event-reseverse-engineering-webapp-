import { NextRequest, NextResponse } from "next/server";
import { competitionEngine } from "@/lib/server/competitionEngine";

export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get("ras_session_id")?.value;

  if (!sessionId) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const session = competitionEngine.getSession(sessionId);
  if (!session) {
    return NextResponse.json({ authenticated: false, error: "Session not found" }, { status: 401 });
  }

  const challenges = competitionEngine.getTeamChallenges(session.team_id);
  const overview = await competitionEngine.getAdminLiveOverview();
  const team = overview.teams.find((t) => t.id === session.team_id);

  return NextResponse.json({
    authenticated: true,
    session,
    team,
    challenges,
    serverTime: new Date().toISOString(),
  });
}
