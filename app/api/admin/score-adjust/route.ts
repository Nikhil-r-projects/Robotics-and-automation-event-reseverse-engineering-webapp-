import { NextRequest, NextResponse } from "next/server";
import { competitionEngine } from "@/lib/server/competitionEngine";

export async function POST(req: NextRequest) {
  const adminToken = req.cookies.get("ras_admin_token")?.value;
  if (!adminToken) {
    return NextResponse.json({ success: false, error: "Admin unauthorized" }, { status: 401 });
  }

  const { teamId, delta, reason } = await req.json();
  if (!teamId || delta === undefined) {
    return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
  }

  const result = competitionEngine.adminAdjustScore(teamId, Number(delta), reason || "Manual adjustment");
  return NextResponse.json(result);
}
