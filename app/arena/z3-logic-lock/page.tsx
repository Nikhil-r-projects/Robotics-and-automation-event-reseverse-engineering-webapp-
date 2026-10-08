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
import { Sliders, Send, HelpCircle, AlertOctagon, RotateCcw, CheckCircle2, History } from "lucide-react";

interface Z3Payload {
  riddleLines: string[];
  buttonMappings: {
    A: number[];
    B: number[];
    C: number[];
    D: number[];
  };
  initialBits: number[];
}

export default function LogicLockPage() {
  const router = useRouter();
  const { team, refreshState } = useArenaSession();

  const [loading, setLoading] = useState(true);
  const [challengeState, setChallengeState] = useState<any>(null);
  const [puzzle, setPuzzle] = useState<Z3Payload | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // Modals
  const [showIntro, setShowIntro] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showAbandon, setShowAbandon] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Stage 1 (Riddle) State
  const [stage1Input, setStage1Input] = useState(["0", "0", "0", "0", "0", "0", "0", "0"]);
  const [stage1Solved, setStage1Solved] = useState(false);

  // Stage 2 (Mystery Buttons) State
  const [currentLeds, setCurrentLeds] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0]);
  const [actionHistory, setActionHistory] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [revealedHints, setRevealedHints] = useState<string[]>([]);

  const fetchChallenge = useCallback(async () => {
    try {
      const res = await fetch("/api/challenge/details?id=z3");
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

      if (data.challenge.current_stage >= 2) {
        setStage1Solved(true);
      }

      if (data.challenge.status === "AVAILABLE" || data.challenge.status === "LOCKED") {
        setShowIntro(true);
      } else if (data.challenge.status === "COMPLETED" || data.challenge.status === "TIMEOUT" || data.challenge.status === "ABANDONED") {
        setShowResult(true);
      }
    } catch (err) {
      console.error("Failed to load Z3:", err);
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
        body: JSON.stringify({ challengeId: "z3" }),
      });
      const data = await res.json();
      if (data.success) {
        setShowIntro(false);
        setChallengeState(data.challenge);
        setRemainingSeconds(data.remainingSeconds);
        refreshState();
      }
    } catch (err) {
      console.error("Start challenge error:", err);
    }
  };

  // Toggle stage 1 bit
  const toggleStage1Bit = (idx: number) => {
    setStage1Input((prev) => {
      const next = [...prev];
      next[idx] = next[idx] === "1" ? "0" : "1";
      return next;
    });
  };

  // Submit Stage 1 Riddle
  const handleSubmitStage1 = async () => {
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/challenge/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: "z3",
          stage: 1,
          answer: stage1Input.join(""),
        }),
      });
      const data = await res.json();

      if (data.timeout) {
        setChallengeState((prev: any) => ({ ...prev, status: "TIMEOUT" }));
        setShowResult(true);
      } else if (data.isCorrect) {
        setStage1Solved(true);
        setChallengeState((prev: any) => ({ ...prev, current_stage: 2, score_earned: 30 }));
        setFeedback("Stage A Riddle Deciphered (+30 PTS). Circuit unlocked for Stage B!");
        refreshState();
      } else {
        setFeedback("Positional parity mismatch. Re-read Rivo's riddle carefully.");
      }
    } catch (err) {
      console.error("Stage 1 submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Press Mystery Button in Stage 2
  const pressMysteryButton = (btnKey: "A" | "B" | "C" | "D") => {
    if (!puzzle?.buttonMappings) return;
    const toggledIndices = puzzle.buttonMappings[btnKey] || [];

    setCurrentLeds((prev) => {
      const next = [...prev];
      toggledIndices.forEach((idx) => {
        next[idx] = next[idx] === 1 ? 0 : 1;
      });
      return next;
    });

    const displayLeds = toggledIndices.map((i) => i + 1).join(", ");
    setActionHistory((prev) => [
      `Button ${btnKey} pressed → LEDs [${displayLeds}] toggled`,
      ...prev.slice(0, 7),
    ]);
  };

  // Submit Stage 2 LED lock configuration
  const handleSubmitStage2 = async () => {
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/challenge/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: "z3",
          stage: 2,
          answer: currentLeds,
        }),
      });
      const data = await res.json();

      if (data.timeout) {
        setChallengeState((prev: any) => ({ ...prev, status: "TIMEOUT" }));
        setShowResult(true);
      } else if (data.isCorrect) {
        setChallengeState((prev: any) => ({ ...prev, status: "COMPLETED", score_earned: 100 }));
        setShowResult(true);
        refreshState();
      } else {
        setFeedback("Target state not reached. Current diodes do not match Stage A target.");
      }
    } catch (err) {
      console.error("Stage 2 submit error:", err);
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
        body: JSON.stringify({ challengeId: "z3" }),
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
        body: JSON.stringify({ challengeId: "z3" }),
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
        [INITIALIZING LOGIC LOCK MATRIX...]
      </div>
    );
  }

  const isTimerActive = challengeState?.status === "ACTIVE";

  return (
    <div className="min-h-screen bg-[#0b0e14] flex flex-col pb-16">
      <ArenaHeader
        title="Z3 :: LOGIC LOCK"
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
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-[#232b3e] pb-4">
            <div className="flex items-center gap-2.5">
              <Sliders className="w-5 h-5 text-[#ff7a00]" />
              <h2 className="text-base font-bold uppercase text-white font-mono tracking-wider">
                TWO-STAGE INVERTIBLE LOGIC MATRIX
              </h2>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className={stage1Solved ? "text-[#10b981]" : "text-[#ff7a00]"}>
                STAGE A: {stage1Solved ? "SOLVED (30/30)" : "ACTIVE (30 PTS)"}
              </span>
              <span>•</span>
              <span className={stage1Solved ? "text-[#00f0ff]" : "text-[#64748b]"}>
                STAGE B: 70 PTS
              </span>
            </div>
          </div>

          {/* STAGE A: RIVO POSITIONAL RIDDLE */}
          <div className="p-6 bg-[#0b0e14] border border-[#232b3e] rounded-xl space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-mono text-[#ff7a00] uppercase font-bold tracking-wider">
                  STAGE A :: RIVO POSITIONAL RIDDLE (30 PTS)
                </span>
                <p className="text-xs text-[#94a3b8]">
                  Convert Rivo&apos;s cryptic positional instructions into an 8-bit target configuration.
                </p>
              </div>
              <RivoAvatar size={48} mood="curious" className="shrink-0" />
            </div>

            {/* Riddle Lines Box */}
            <div className="p-4 bg-[#121722] border-l-2 border-[#ff7a00] rounded space-y-2 text-xs font-mono text-[#e2e8f0] leading-relaxed">
              {puzzle?.riddleLines.map((line, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-[#ff7a00] font-bold">{idx + 1}.</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>

            {/* Stage A 8-Bit Input */}
            <div className="space-y-3">
              <div className="text-[11px] font-mono text-[#94a3b8] uppercase">
                TARGET BITSTREAM ENTRY (CLICK TO TOGGLE 1 / 0):
              </div>
              <div className="grid grid-cols-8 gap-2 sm:gap-3">
                {stage1Input.map((bit, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={stage1Solved}
                    onClick={() => toggleStage1Bit(idx)}
                    className={`py-3 rounded font-mono text-base sm:text-xl font-bold border-2 transition-all ${
                      bit === "1"
                        ? "bg-[#ff7a00] border-[#ff9933] text-[#0b0e14] shadow-[0_0_12px_rgba(255,122,0,0.3)]"
                        : "bg-[#182030] border-[#232b3e] text-[#64748b] hover:border-[#ff7a00]/50"
                    } ${stage1Solved ? "opacity-75 cursor-default" : ""}`}
                  >
                    <div>{bit}</div>
                    <div className="text-[9px] uppercase tracking-tighter opacity-80">
                      L{idx + 1}
                    </div>
                  </button>
                ))}
              </div>

              {!stage1Solved && (
                <button
                  onClick={handleSubmitStage1}
                  disabled={submitting || challengeState?.status !== "ACTIVE"}
                  className="w-full mt-2 py-3 px-6 rounded bg-[#ff7a00] hover:bg-[#ff9933] text-[#0b0e14] font-mono text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? "VERIFYING RIDDLE..." : "VERIFY STAGE A RIDDLE (+30 PTS)"}</span>
                </button>
              )}
            </div>
          </div>

          {/* STAGE B: MYSTERY BUTTONS MATRIX */}
          <div
            className={`p-6 rounded-xl space-y-6 transition-all ${
              stage1Solved
                ? "bg-[#182030] border-2 border-[#00f0ff]/50 shadow-[0_0_20px_rgba(0,240,255,0.1)]"
                : "bg-[#0e121a] border border-[#1d2535] opacity-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-[#00f0ff] uppercase font-bold tracking-wider">
                  STAGE B :: REVERSE THE LOCK (70 PTS)
                </span>
                <p className="text-xs text-[#94a3b8] mt-0.5">
                  Mystery buttons toggle internal diode circuits. Reproduce the target state above.
                </p>
              </div>
              <button
                type="button"
                disabled={!stage1Solved}
                onClick={() => setCurrentLeds([0, 0, 0, 0, 0, 0, 0, 0])}
                className="text-xs font-mono text-[#64748b] hover:text-[#94a3b8] flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>RESET DIODES</span>
              </button>
            </div>

            {/* 8 Diodes Visual Panel */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-[#94a3b8] uppercase">
                ACTIVE DIODE BANK (8-BIT HARDWARE REGISTER):
              </span>
              <div className="grid grid-cols-8 gap-2 sm:gap-3">
                {currentLeds.map((bit, idx) => (
                  <div
                    key={idx}
                    className={`py-3 rounded flex flex-col items-center justify-center font-mono text-base sm:text-xl font-bold border-2 transition-all ${
                      bit === 1
                        ? "bg-[#00f0ff]/20 border-[#00f0ff] text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                        : "bg-[#0b0e14] border-[#232b3e] text-[#64748b]"
                    }`}
                  >
                    <div>{bit === 1 ? "ON" : "OFF"}</div>
                    <div className="text-[9px] uppercase tracking-tighter opacity-80 text-[#94a3b8]">
                      LED {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Four Mystery Buttons */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-[#94a3b8] uppercase">
                MYSTERY TOGGLE SWITCHES:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(["A", "B", "C", "D"] as const).map((btn) => (
                  <button
                    key={btn}
                    type="button"
                    disabled={!stage1Solved || challengeState?.status !== "ACTIVE"}
                    onClick={() => pressMysteryButton(btn)}
                    className="py-3 px-4 rounded bg-[#0b0e14] hover:bg-[#121722] border border-[#232b3e] hover:border-[#00f0ff] text-sm font-mono font-bold text-white transition-all flex flex-col items-center gap-1 shadow-[0_0_10px_rgba(0,0,0,0.3)] disabled:opacity-50 cursor-pointer"
                  >
                    <span className="text-base text-[#00f0ff]">BUTTON {btn}</span>
                    <span className="text-[9px] font-mono text-[#64748b] uppercase">
                      TRIGGER PULSE
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action History Log */}
            {actionHistory.length > 0 && (
              <div className="p-3 bg-[#0b0e14] border border-[#232b3e] rounded space-y-1.5 text-xs font-mono">
                <div className="flex items-center gap-1.5 text-[#ff7a00]">
                  <History className="w-3.5 h-3.5" />
                  <span className="font-bold">OBSERVED TOGGLE HISTORY:</span>
                </div>
                <div className="space-y-1 text-[#94a3b8] text-[11px]">
                  {actionHistory.map((item, idx) => (
                    <div key={idx}>• {item}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Stage 2 Submit */}
            {stage1Solved && (
              <button
                onClick={handleSubmitStage2}
                disabled={submitting || challengeState?.status !== "ACTIVE"}
                className="w-full py-3.5 px-6 rounded bg-[#00f0ff] hover:bg-[#7df4ff] text-[#0b0e14] font-mono text-sm font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{submitting ? "VERIFYING MATRIX..." : "BREACH LOCK (+70 PTS)"}</span>
              </button>
            )}
          </div>

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
              <span>HINT (-15 PTS)</span>
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
        title="Z3 — LOGIC LOCK"
        tagline="TWO-STAGE POSITIONAL RIDDLE & MYSTERY PARITY MATRIX"
        points={100}
        durationMinutes={10}
        rivoQuote="My diodes are locked down. Read my clues to find the target state, then figure out which buttons flip what."
        technicalBriefing="Stage A: Translate positional riddle into target 8-bit state (+30 pts). Stage B: Experiment with mystery buttons [A, B, C, D] to match the target LEDs (+70 pts)."
        onReady={handleReady}
      />

      <HintModal
        isOpen={showHint}
        cost={15}
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
        title="LOGIC LOCK"
        pointsEarned={challengeState?.score_earned || 0}
        maxPoints={100}
        timeUsedFormatted="--:--"
        attempts={challengeState?.attempts || 1}
        hintsUsed={challengeState?.hints_used || revealedHints.length}
        isTimeout={challengeState?.status === "TIMEOUT"}
        isAbandoned={challengeState?.status === "ABANDONED"}
      />
    </div>
  );
}
