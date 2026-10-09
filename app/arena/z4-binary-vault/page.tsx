"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArenaHeader } from "@/components/shared/ArenaHeader";
import { RivoBriefingModal } from "@/components/shared/RivoBriefingModal";
import { HintModal } from "@/components/shared/HintModal";
import { AbandonModal } from "@/components/shared/AbandonModal";
import { ChallengeResultModal } from "@/components/shared/ChallengeResultModal";
import { RivoAvatar } from "@/components/shared/RivoAvatar";
import { useArenaSession } from "@/hooks/useArenaSession";
import { Binary, Send, HelpCircle, AlertOctagon, CheckCircle2, Key, Lock, Unlock } from "lucide-react";

interface Z4Payload {
  stage1Binary: string;
  stage2Hex?: string;
  stage3Question?: string;
  finalInstruction?: string;
}

export default function BinaryVaultPage() {
  const router = useRouter();
  const { team, refreshState } = useArenaSession();

  const [loading, setLoading] = useState(true);
  const [challengeState, setChallengeState] = useState<any>(null);
  const [puzzle, setPuzzle] = useState<Z4Payload | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // Modals
  const [showIntro, setShowIntro] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showAbandon, setShowAbandon] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Stage states
  const [currentStage, setCurrentStage] = useState(1);
  const [stage1Input, setStage1Input] = useState("");
  const [stage2Input, setStage2Input] = useState("");
  const [stage3Input, setStage3Input] = useState("");
  const [stage4Input, setStage4Input] = useState("");

  const [feedback, setFeedback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [revealedHints, setRevealedHints] = useState<string[]>([]);
  const [recoveredFragment, setRecoveredFragment] = useState<string | undefined>();

  const fetchChallenge = useCallback(async () => {
    try {
      const res = await fetch("/api/challenge/details?id=z4");
      if (!res.ok) {
        router.replace("/arena");
        return;
      }
      const data = await res.json();
      if (data.eliminated) {
        router.replace("/eliminated");
        return;
      }
      setChallengeState(data.challenge);
      setPuzzle(data.puzzlePayload);
      setRemainingSeconds(data.remainingSeconds);
      setCurrentStage(data.challenge.current_stage || 1);

      if (data.challenge.status === "AVAILABLE" || data.challenge.status === "LOCKED") {
        setShowIntro(true);
      } else if (data.challenge.status === "COMPLETED" || data.challenge.status === "TIMEOUT" || data.challenge.status === "ABANDONED") {
        setShowResult(true);
      }
    } catch (err) {
      console.error("Failed to load Z4:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchChallenge();
  }, [fetchChallenge]);

  const handleReady = async () => {
    try {
      const res = await fetch("/api/challenge/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId: "z4" }),
      });
      const data = await res.json();
      if (data.success) {
        setShowIntro(false);
        setChallengeState(data.challenge);
        setRemainingSeconds(data.remainingSeconds);
        refreshState();
        fetchChallenge();
      }
    } catch (err) {
      console.error("Start challenge error:", err);
    }
  };

  // Submit Stage
  const handleSubmitStage = async (stageNum: number, answerValue: string) => {
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/challenge/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: "z4",
          stage: stageNum,
          answer: answerValue.trim(),
        }),
      });
      const data = await res.json();

      if (data.timeout) {
        setChallengeState((prev: any) => ({ ...prev, status: "TIMEOUT" }));
        setShowResult(true);
      } else if (data.isCorrect) {
        setChallengeState((prev: any) => ({
          ...prev,
          current_stage: data.currentStage || stageNum + 1,
          score_earned: (prev?.score_earned || 0) + (data.pointsAwarded || 0),
        }));

        if (data.challengeComplete) {
          setRecoveredFragment(data.fragmentRecovered);
          setChallengeState((prev: any) => ({ ...prev, status: "COMPLETED" }));
          setShowResult(true);
        } else {
          setFeedback(`Stage ${stageNum} Deciphered! (+${data.pointsAwarded} PTS). Advanced to Stage ${stageNum + 1}.`);
          fetchChallenge();
        }
        refreshState();
      } else {
        setFeedback("Decipher mismatch. Check parity and formatting.");
      }
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Hint Confirm
  const handleConfirmHint = async (): Promise<string | null> => {
    try {
      const res = await fetch("/api/challenge/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId: "z4" }),
      });
      const data = await res.json();
      if (data.success && data.hintText) {
        setRevealedHints((prev) => [...prev, data.hintText]);
        refreshState();
        return data.hintText;
      }
    } catch (err) {
      console.error("Hint error:", err);
    }
    return null;
  };

  // Abandon Confirm
  const handleConfirmAbandon = async () => {
    try {
      const res = await fetch("/api/challenge/abandon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId: "z4" }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAbandon(false);
        router.push("/arena");
      }
    } catch (err) {
      console.error("Abandon error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0e14] text-[#ff7a00] font-mono text-sm">
        [INITIALIZING HIGH-SECURITY BINARY VAULT...]
      </div>
    );
  }

  const isTimerActive = challengeState?.status === "ACTIVE";

  return (
    <div className="min-h-screen bg-[#0b0e14] flex flex-col pb-16">
      {/* Subtle inspectable DOM clue as required by Section 22 */}
      {/* <!-- FORENSIC NOTE :: Diagnostic Kernel Name: RIVO | DO NOT ERASE --> */}

      <ArenaHeader
        title="Z4 :: BINARY VAULT"
        teamNumber={team?.team_number}
        teamName={team?.team_name}
        score={team?.total_score || 0}
        remainingSeconds={remainingSeconds}
        timerActive={isTimerActive}
        onTimerExpire={() => {
          setChallengeState((prev: any) => ({ ...prev, status: "TIMEOUT" }));
          setShowResult(true);
        }}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full space-y-6">
        <div className="chassis-panel rounded-xl p-6 sm:p-8 space-y-8 bg-[#121722] border border-[#232b3e]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#232b3e] pb-4">
            <div className="flex items-center gap-2.5">
              <Binary className="w-5 h-5 text-[#ff7a00]" />
              <h2 className="text-base font-bold uppercase text-white font-mono tracking-wider">
                MULTI-TIER DE-CIPHER VAULT (200 PTS)
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#00f0ff]">
              <Lock className="w-3.5 h-3.5" />
              <span>STAGE {currentStage} OF 4</span>
            </div>
          </div>

          {/* Stepper Progress */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
            <div className={`p-2 rounded border ${currentStage >= 1 ? "bg-[#182030] border-[#ff7a00] text-white" : "bg-[#0b0e14] border-[#232b3e] text-[#64748b]"}`}>
              1. BINARY → ASCII (50)
            </div>
            <div className={`p-2 rounded border ${currentStage >= 2 ? "bg-[#182030] border-[#00f0ff] text-white" : "bg-[#0b0e14] border-[#232b3e] text-[#64748b]"}`}>
              2. HEX → ASCII (50)
            </div>
            <div className={`p-2 rounded border ${currentStage >= 3 ? "bg-[#182030] border-[#10b981] text-white" : "bg-[#0b0e14] border-[#232b3e] text-[#64748b]"}`}>
              3. RIDDLE (30)
            </div>
            <div className={`p-2 rounded border ${currentStage >= 4 ? "bg-[#182030] border-[#ff9933] text-white" : "bg-[#0b0e14] border-[#232b3e] text-[#64748b]"}`}>
              4. MASTER UNLOCK (70)
            </div>
          </div>

          {/* STAGE 1: BINARY DECODE */}
          <div className="p-6 bg-[#0b0e14] border border-[#232b3e] rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#ff7a00] uppercase font-bold tracking-wider">
                STAGE 1 :: 8-BIT BINARY MEMORY STREAM (+50 PTS)
              </span>
              {currentStage > 1 && <span className="text-xs font-mono text-[#10b981]">✓ COMPLETE</span>}
            </div>

            <div className="p-4 bg-[#121722] border border-[#232b3e] rounded text-xs font-mono text-[#00f0ff] break-all leading-loose select-all">
              {puzzle?.stage1Binary}
            </div>

            {currentStage === 1 && (
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <input
                  type="text"
                  placeholder="ENTER DECODED ASCII (e.g. HEX: 41 42 43...)"
                  value={stage1Input}
                  onChange={(e) => setStage1Input(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-2.5 bg-[#182030] border border-[#232b3e] focus:border-[#ff7a00] rounded text-sm text-white font-mono uppercase tracking-wider outline-none"
                />
                <button
                  onClick={() => handleSubmitStage(1, stage1Input)}
                  disabled={submitting || !stage1Input || challengeState?.status !== "ACTIVE"}
                  className="px-6 py-2.5 rounded bg-[#ff7a00] hover:bg-[#ff9933] text-[#0b0e14] font-mono text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>SUBMIT STAGE 1</span>
                </button>
              </div>
            )}
          </div>

          {/* STAGE 2: HEX DECODE */}
          {currentStage >= 2 && (
            <div className="p-6 bg-[#0b0e14] border border-[#232b3e] rounded-xl space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#00f0ff] uppercase font-bold tracking-wider">
                  STAGE 2 :: HEXADECIMAL BYTE BUFFER (+50 PTS)
                </span>
                {currentStage > 2 && <span className="text-xs font-mono text-[#10b981]">✓ COMPLETE</span>}
              </div>

              <div className="p-4 bg-[#121722] border border-[#232b3e] rounded text-sm font-mono text-[#ff9933] tracking-widest">
                HEX BYTES: {puzzle?.stage2Hex}
              </div>

              {currentStage === 2 && (
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <input
                    type="text"
                    placeholder="ENTER DECODED KEYWORD"
                    value={stage2Input}
                    onChange={(e) => setStage2Input(e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-2.5 bg-[#182030] border border-[#232b3e] focus:border-[#00f0ff] rounded text-sm text-white font-mono uppercase tracking-wider outline-none"
                  />
                  <button
                    onClick={() => handleSubmitStage(2, stage2Input)}
                    disabled={submitting || !stage2Input || challengeState?.status !== "ACTIVE"}
                    className="px-6 py-2.5 rounded bg-[#00f0ff] hover:bg-[#7df4ff] text-[#0b0e14] font-mono text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>SUBMIT STAGE 2</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STAGE 3: RIVO RIDDLE */}
          {currentStage >= 3 && (
            <div className="p-6 bg-[#0b0e14] border border-[#232b3e] rounded-xl space-y-4 animate-in fade-in duration-300">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-mono text-[#10b981] uppercase font-bold tracking-wider">
                    STAGE 3 :: COMPANION IDENTITY VERIFICATION (+30 PTS)
                  </span>
                  <p className="text-sm font-semibold text-white italic">
                    &ldquo;Do you remember me?&rdquo;
                  </p>
                </div>
                <RivoAvatar size={48} mood="curious" className="shrink-0" />
              </div>

              {currentStage === 3 && (
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <input
                    type="text"
                    placeholder="WHO AM I? (ENTER COMPANION CALLSIGN)"
                    value={stage3Input}
                    onChange={(e) => setStage3Input(e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-2.5 bg-[#182030] border border-[#232b3e] focus:border-[#10b981] rounded text-sm text-white font-mono uppercase tracking-wider outline-none"
                  />
                  <button
                    onClick={() => handleSubmitStage(3, stage3Input)}
                    disabled={submitting || !stage3Input || challengeState?.status !== "ACTIVE"}
                    className="px-6 py-2.5 rounded bg-[#10b981] hover:bg-[#4edea3] text-[#0b0e14] font-mono text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>SUBMIT STAGE 3</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STAGE 4: FINAL MASTER UNLOCK */}
          {currentStage >= 4 && (
            <div className="p-6 bg-[#182030] border-2 border-[#ff7a00] rounded-xl space-y-4 animate-in fade-in duration-300 shadow-[0_0_20px_rgba(255,122,0,0.2)]">
              <div className="flex items-center gap-2 text-[#ff7a00]">
                <Key className="w-5 h-5" />
                <span className="text-xs font-mono uppercase font-bold tracking-wider">
                  STAGE 4 :: MASTER VAULT OVERRIDE (+70 PTS)
                </span>
              </div>
              <p className="text-xs text-[#94a3b8]">
                Format string: <code className="text-[#00f0ff] font-mono">RIVO-[STAGE_2_WORD]-99</code>
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <input
                  type="text"
                  placeholder="e.g. RIVO-VAULT-99"
                  value={stage4Input}
                  onChange={(e) => setStage4Input(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-3 bg-[#0b0e14] border border-[#ff7a00]/50 focus:border-[#ff7a00] rounded text-sm text-white font-mono uppercase tracking-widest outline-none"
                />
                <button
                  onClick={() => handleSubmitStage(4, stage4Input)}
                  disabled={submitting || !stage4Input || challengeState?.status !== "ACTIVE"}
                  className="px-8 py-3 rounded bg-[#ff7a00] hover:bg-[#ff9933] text-[#0b0e14] font-mono text-sm font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,122,0,0.3)]"
                >
                  <Unlock className="w-4 h-4" />
                  <span>DISENGAGE VAULT</span>
                </button>
              </div>
            </div>
          )}

          {feedback && (
            <div className="p-3 bg-[#ff7a00]/15 border border-[#ff7a00] rounded text-xs text-[#ff7a00] font-mono text-center">
              {feedback}
            </div>
          )}

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-between border-t border-[#232b3e] pt-4">
            <button
              onClick={() => setShowHint(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded bg-[#182030] hover:bg-[#232b3e] border border-[#232b3e] text-xs font-mono text-[#ff9933] uppercase transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>HINT (-20 PTS)</span>
            </button>

            <button
              onClick={() => setShowAbandon(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded bg-[#ef4444]/10 hover:bg-[#ef4444]/20 border border-[#ef4444]/40 text-xs font-mono text-[#ef4444] uppercase transition-colors"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>ABANDON CHALLENGE</span>
            </button>
          </div>
        </div>
      </main>

      {/* Modals */}
      <RivoBriefingModal
        isOpen={showIntro}
        title="Z4 — BINARY VAULT"
        tagline="MULTI-STAGE BINARY, HEXADECIMAL & MEMORY DECRYPT"
        points={200}
        durationMinutes={15}
        rivoQuote="I found some raw machine data in the memory banks. It doesn't look like normal text. Maybe you can decode it."
        technicalBriefing="Execute a 4-tier disassembly pipeline: Binary -> Hex ASCII -> ASCII Word -> Memory verification -> Master key unlock."
        onReady={handleReady}
      />

      <HintModal
        isOpen={showHint}
        cost={20}
        onClose={() => setShowHint(false)}
        onConfirm={handleConfirmHint}
        revealedHints={revealedHints}
      />

      <AbandonModal
        isOpen={showAbandon}
        onCancel={() => setShowAbandon(false)}
        onConfirm={handleConfirmAbandon}
      />

      <ChallengeResultModal
        isOpen={showResult}
        title="BINARY VAULT"
        pointsEarned={challengeState?.score_earned || 0}
        maxPoints={200}
        timeUsedFormatted="--:--"
        attempts={challengeState?.attempts || 1}
        hintsUsed={challengeState?.hints_used || revealedHints.length}
        fragmentRecovered={recoveredFragment}
        isTimeout={challengeState?.status === "TIMEOUT"}
        isAbandoned={challengeState?.status === "ABANDONED"}
      />
    </div>
  );
}
