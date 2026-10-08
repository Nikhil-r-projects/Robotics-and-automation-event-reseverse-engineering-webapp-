import { NextRequest, NextResponse } from "next/server";
import { competitionEngine } from "@/lib/server/competitionEngine";
import { ChallengeId } from "@/types/arena";

export async function POST(req: NextRequest) {
  const adminToken = req.cookies.get("ras_admin_token")?.value;
  if (!adminToken) {
    return NextResponse.json({ success: false, error: "Admin unauthorized" }, { status: 401 });
  }

  const { teamId, challengeId } = await req.json();
  if (!teamId || !challengeId) {
    return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
  }

  const result = competitionEngine.adminResetChallenge(teamId, challengeId as ChallengeId);
  return NextResponse.json(result);
}
