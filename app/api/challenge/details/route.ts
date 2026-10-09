import { NextRequest, NextResponse } from "next/server";
import { competitionEngine } from "@/lib/server/competitionEngine";
import { ChallengeId } from "@/types/arena";
import {
  generateZ1,
  generateZ2,
  generateZ3,
  generateZ4,
  generateZ5,
} from "@/lib/challenges/seedGenerator";

export async function GET(req: NextRequest) {
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

  if (!session) {
    return NextResponse.json({ success: false, error: "Session invalid" }, { status: 401 });
  }

  if (session.status === "ELIMINATED") {
    return NextResponse.json({ success: false, eliminated: true }, { status: 403 });
  }

  const challengeId = req.nextUrl.searchParams.get("id") as ChallengeId;
  if (!challengeId || !["z1", "z2", "z3", "z4", "z5"].includes(challengeId)) {
    return NextResponse.json({ success: false, error: "Invalid challenge ID" }, { status: 400 });
  }

  const ch = competitionEngine.getChallenge(session.team_id, challengeId);
  if (!ch) {
    return NextResponse.json({ success: false, error: "Challenge not found" }, { status: 404 });
  }

  if (ch.status === "LOCKED") {
    return NextResponse.json({ success: false, error: "Zone locked" }, { status: 403 });
  }

  // Calculate remaining seconds based on server deadline
  let remainingSeconds = 0;
  if (ch.status === "ACTIVE" && ch.deadline_at) {
    const diff = Math.floor((new Date(ch.deadline_at).getTime() - Date.now()) / 1000);
    remainingSeconds = Math.max(0, diff);
    if (diff <= 0) {
      ch.status = "TIMEOUT";
    }
  }

  // Generate team-specific presentation payload (stripping server secrets!)
  let puzzlePayload: Record<string, unknown> = {};

  if (challengeId === "z1") {
    const z1 = generateZ1(session.team_number);
    puzzlePayload = {
      sequences: z1.sequences,
      ruleHint: z1.ruleHint,
    };
  } else if (challengeId === "z2") {
    const z2 = generateZ2(session.team_number);
    puzzlePayload = {
      channel1Word: z2.channel1Word,
      channel2Word: z2.channel2Word,
      unknownMorse: z2.unknownMorse,
      wordLength: z2.unknownWord.length,
    };
  } else if (challengeId === "z3") {
    const z3 = generateZ3(session.team_number);
    puzzlePayload = {
      riddleLines: z3.riddleLines,
      buttonMappings: z3.buttonMappings,
      initialBits: z3.initialBits,
    };
  } else if (challengeId === "z4") {
    const z4 = generateZ4(session.team_number);
    puzzlePayload = {
      stage1Binary: z4.stage1Binary,
      stage2Hex: ch.current_stage >= 2 ? z4.stage2Hex : undefined,
      stage3Question: ch.current_stage >= 3 ? z4.stage3Question : undefined,
      finalInstruction: ch.current_stage >= 4 ? "Combine recovered key token with system protocol format: RIVO-[KEY]-99" : undefined,
    };
  } else if (challengeId === "z5") {
    const z5 = generateZ5(session.team_number);
    puzzlePayload = {
      deviceId: z5.deviceId,
      kernelHash: z5.kernelHash,
      anomalousFrequency: z5.anomalousFrequency,
    };
  }

  return NextResponse.json({
    success: true,
    challenge: ch,
    remainingSeconds,
    puzzlePayload,
    serverTime: new Date().toISOString(),
  });
}
