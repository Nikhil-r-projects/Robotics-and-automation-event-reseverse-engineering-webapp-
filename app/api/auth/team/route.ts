import { NextRequest, NextResponse } from "next/server";
import { competitionEngine } from "@/lib/server/competitionEngine";

export async function POST(req: NextRequest) {
  try {
    const { teamNumber, teamName, accessCode } = await req.json();

    if (!teamNumber || !teamName || !accessCode) {
      return NextResponse.json(
        { success: false, error: "Team Number, Team Name, and Access Code are required." },
        { status: 400 }
      );
    }

    const result = await competitionEngine.authenticateTeam(teamNumber, teamName, accessCode);

    if (!result.success || !result.session) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      session: result.session,
      team: result.team,
    });

    // Set signed HTTP-only session cookie
    response.cookies.set("ras_session_id", result.session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 hours
    });

    return response;
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
