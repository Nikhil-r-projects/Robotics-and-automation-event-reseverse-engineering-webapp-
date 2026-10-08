import { NextRequest, NextResponse } from "next/server";
import { competitionEngine } from "@/lib/server/competitionEngine";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!competitionEngine.verifyAdmin(username, password)) {
      return NextResponse.json(
        { success: false, error: "Invalid admin credentials" },
        { status: 401 }
      );
    }

    const adminToken = `adm-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const response = NextResponse.json({ success: true });

    response.cookies.set("ras_admin_token", adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 12,
    });

    return response;
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
