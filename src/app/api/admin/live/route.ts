import { NextRequest, NextResponse } from "next/server";
import { competitionEngine } from "@/lib/server/competitionEngine";

export async function GET(req: NextRequest) {
  const adminToken = req.cookies.get("ras_admin_token")?.value;
  if (!adminToken) {
    return NextResponse.json({ success: false, error: "Admin unauthorized" }, { status: 401 });
  }

  const liveData = await competitionEngine.getAdminLiveOverview();
  return NextResponse.json({
    success: true,
    ...liveData,
    serverTime: new Date().toISOString(),
  });
}
