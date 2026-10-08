import { NextRequest, NextResponse } from "next/server";
import { competitionEngine } from "@/lib/server/competitionEngine";

export async function POST(req: NextRequest) {
  const adminToken = req.cookies.get("ras_admin_token")?.value;
  if (!adminToken) {
    return NextResponse.json({ success: false, error: "Admin unauthorized" }, { status: 401 });
  }

  const { teamId } = await req.json();
  if (!teamId) {
    return NextResponse.json({ success: false, error: "Missing teamId" }, { status: 400 });
  }

  const result = competitionEngine.adminRestartTeam(teamId);
  return NextResponse.json(result);
}
