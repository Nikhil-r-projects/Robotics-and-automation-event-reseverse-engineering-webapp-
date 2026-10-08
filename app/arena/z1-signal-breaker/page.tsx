"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArenaHeader } from "@/components/shared/ArenaHeader";
import { RivoBriefingModal } from "@/components/shared/RivoBriefingModal";
import { HintModal } from "@/components/shared/HintModal";
import { AbandonModal } from "@/components/shared/AbandonModal";
import { ChallengeResultModal } from "@/components/shared/ChallengeResultModal";
import { useArenaSession } from "@/hooks/useArenaSession";
import { Activity, Send, HelpCircle, AlertOctagon, RotateCcw } from "lucide-react";

interface Z1Payload {
  sequences: string[][];
  ruleHint: string;
}

export default function SignalBreakerPage() {
  const router = useRouter();
  const { team, refreshState } = useArenaSession();

  const [loading, setLoading] = useState(true);
  const [challengeState, setChallengeState] = useState<any>(null);
  const [puzzle, setPuzzle] = useState<Z1Payload | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // Modals
  const [showIntro, setShowIntro] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showAbandon, setShowAbandon] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Gameplay state
  const [userSelection, setUserSelection] = useState<string[]>(["○", "○", "○", "○", "○"]);
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [revealedHints, setRevealedHints] = useState<string[]>([]);

  // Fetch challenge details
  const fetchChallenge = useCallback(async () => {
    try {
      const res = await fetch("/api/challenge/details?id=z1");
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

      if (data.challenge.status === "AVAILABLE" || data.challenge.status === "LOCKED") {
        setShowIntro(true);
      } else if (data.challenge.status === "COMPLETED" || data.challenge.status === "TIMEOUT" || data.challenge.status === "ABANDONED") {
        setShowResult(true);
      }
    } catch (err) {
      console.error("Failed to load Z1:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchChallenge();
  }, [fetchChallenge]);

  // Handle Ready click in Rivo modal
  const handleReady = async () => {
    try {
      const res = await fetch("/api/challenge/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId: "z1" }),
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

  // Toggle bit at index
  const toggleSymbol = (index: number) => {
    setUserSelection((prev) => {
      const next = [...prev];
      next[index] = next[index] === "●" ? "○" : "●";
      return next;
    });
  };

  // Submit Answer
  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmissionFeedback(null);

    try {
      const res = await fetch("/api/challenge/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: "z1",
          answer: userSelection,
        }),
      });
      const data = await res.json();

      if (data.timeout) {
        setChallengeState((prev: any) => ({ ...prev, status: "TIMEOUT" }));
        setShowResult(true);
      } else if (data.isCorrect) {
        setChallengeState((prev: any) => ({ ...prev, status: "COMPLETED", score_earned: 50 }));
        setShowResult(true);
        refreshState();
      } else {
        setSubmissionFeedback(data.message || "Mismatch detected. Check the pulse cycle rule.");
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
        body: JSON.stringify({ challengeId: "z1" }),
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
        body: JSON.stringify({ challengeId: "z1" }),
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
        [INITIALIZING SIGNAL BREAKER OSCILLOSCOPE...]
      </div>
    );
  }

  const isTimerActive = challengeState?.status === "ACTIVE";

  return (
    <div className="min-h-screen bg-[#0b0e14] flex flex-col pb-16">
      <ArenaHeader
        title="Z1 :: SIGNAL BREAKER"
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
        {/* Oscilloscope Chassis */}
        <div className="chassis-panel rounded-xl p-6 sm:p-8 space-y-8 bg-[#121722] border border-[#232b3e]">
          {/* Top Telemetry */}
          <div className="flex items-center justify-between border-b border-[#232b3e] pb-4">
            <div className="flex items-center gap-2.5">
              <Activity className="w-5 h-5 text-[#ff7a00] animate-pulse" />
              <h2 className="text-base font-bold uppercase text-white font-mono tracking-wider">
                HARMONIC WAVEFORM ANALYZER
              </h2>
            </div>
            <div className="text-xs font-mono text-[#00f0ff]">
              STATUS: {challengeState?.status || "STANDBY"}
            </div>
          </div>

          {/* Observed Signal History */}
          <div className="space-y-4">
            <span className="text-xs font-mono text-[#94a3b8] uppercase tracking-wider block">
              OBSERVED TRANSMISSION CYCLES (TEAM SPECIFIC)
            </span>

            <div className="space-y-3">
              {puzzle?.sequences.map((seq, sIdx) => (
                <div
                  key={sIdx}
                  className="p-4 bg-[#0b0e14] border border-[#232b3e] rounded-lg flex items-center justify-between gap-4"
                >
                  <div className="text-xs font-mono text-[#ff7a00] font-semibold w-24">
                    SIGNAL {sIdx + 1}
                  </div>
                  <div className="flex items-center gap-3">
                    {seq.map((sym, bIdx) => (
                      <div
                        key={bIdx}
                        className={`w-9 h-9 sm:w-11 sm:h-11 rounded flex items-center justify-center font-mono text-lg font-bold border transition-all ${
                          sym === "●"
                            ? "bg-[#ff7a00]/20 border-[#ff7a00] text-[#ff7a00] shadow-[0_0_10px_rgba(255,122,0,0.3)]"
                            : "bg-[#182030] border-[#232b3e] text-[#64748b]"
                        }`}
                      >
                        {sym}
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] font-mono text-[#64748b] hidden sm:block">
                    T_CYC_{sIdx + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Prediction Keypad */}
          <div className="p-6 bg-[#182030] border border-[#ff7a00]/40 rounded-xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-[#ff7a00] uppercase font-bold tracking-wider">
                  PREDICT NEXT SIGNAL (SIGNAL 4)
                </span>
                <p className="text-xs text-[#94a3b8] mt-0.5">
                  Click nodes below to toggle pulse states (● Active / ○ Dormant)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUserSelection(["○", "○", "○", "○", "○"])}
                className="text-xs font-mono text-[#64748b] hover:text-[#94a3b8] flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>RESET</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-3 sm:gap-4 py-2">
              {userSelection.map((sym, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleSymbol(idx)}
                  className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex flex-col items-center justify-center font-mono text-xl sm:text-2xl font-bold border-2 transition-all cursor-pointer ${
                    sym === "●"
                      ? "bg-[#ff7a00] border-[#ff9933] text-[#0b0e14] shadow-[0_0_15px_rgba(255,122,0,0.4)]"
                      : "bg-[#0b0e14] border-[#232b3e] text-[#64748b] hover:border-[#ff7a00]/50"
                  }`}
                >
                  <span>{sym}</span>
                  <span className="text-[9px] font-mono uppercase tracking-tighter opacity-80 mt-1">
                    BIT {idx + 1}
                  </span>
                </button>
              ))}
            </div>

            {submissionFeedback && (
              <div className="p-3 bg-[#ef4444]/15 border border-[#ef4444] rounded text-xs text-[#ef4444] font-mono text-center">
                {submissionFeedback}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting || challengeState?.status !== "ACTIVE"}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded bg-[#ff7a00] hover:bg-[#ff9933] text-[#0b0e14] font-mono text-sm font-bold uppercase tracking-wider transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(255,122,0,0.25)]"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? "TRANSMITTING PREDICTION..." : "VERIFY AND SUBMIT"}</span>
            </button>
          </div>

          {/* Bottom Action Bar: Hint & Abandon */}
          <div className="flex items-center justify-between border-t border-[#232b3e] pt-4">
            <button
              onClick={() => setShowHint(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded bg-[#182030] hover:bg-[#232b3e] border border-[#232b3e] text-xs font-mono text-[#ff9933] uppercase transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>HINT (-10 PTS)</span>
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

      {/* Rivo Briefing Modal */}
      <RivoBriefingModal
        isOpen={showIntro}
        title="Z1 — SIGNAL BREAKER"
        tagline="PATTERN RECOGNITION & HARMONIC WAVEFORM INFERENCE"
        points={50}
        durationMinutes={10}
        rivoQuote="Something is hiding inside this signal. Watch carefully. The machine isn't being random."
        technicalBriefing="Analyze the 3 recorded historical pulse transmissions. Identify the transformation pattern and configure the predicted 5-node pulse signature."
        onReady={handleReady}
      />

      {/* Hint Modal */}
      <HintModal
        isOpen={showHint}
        cost={10}
        onClose={() => setShowHint(false)}
        onConfirm={handleConfirmHint}
        revealedHints={revealedHints}
      />

      {/* Abandon Modal */}
      <AbandonModal
        isOpen={showAbandon}
        onCancel={() => setShowAbandon(false)}
        onConfirm={handleConfirmAbandon}
      />

      {/* Challenge Result Modal */}
      <ChallengeResultModal
        isOpen={showResult}
        title="SIGNAL BREAKER"
        pointsEarned={challengeState?.score_earned || 0}
        maxPoints={50}
        timeUsedFormatted="--:--"
        attempts={challengeState?.attempts || 1}
        hintsUsed={challengeState?.hints_used || revealedHints.length}
        isTimeout={challengeState?.status === "TIMEOUT"}
        isAbandoned={challengeState?.status === "ABANDONED"}
      />
    </div>
  );
}
