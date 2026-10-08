"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArenaHeader } from "@/components/shared/ArenaHeader";
import { RivoBriefingModal } from "@/components/shared/RivoBriefingModal";
import { HintModal } from "@/components/shared/HintModal";
import { AbandonModal } from "@/components/shared/AbandonModal";
import { ChallengeResultModal } from "@/components/shared/ChallengeResultModal";
import { useArenaSession } from "@/hooks/useArenaSession";
import { Box, Send, HelpCircle, AlertOctagon, Cpu, Terminal, ShieldAlert } from "lucide-react";

interface Z5Payload {
  deviceId: string;
  kernelHash: string;
  anomalousFrequency: string;
}

export default function BlackBoxPage() {
  const router = useRouter();
  const { team, refreshState } = useArenaSession();

  const [loading, setLoading] = useState(true);
  const [challengeState, setChallengeState] = useState<any>(null);
  const [puzzle, setPuzzle] = useState<Z5Payload | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // Modals
  const [showIntro, setShowIntro] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showAbandon, setShowAbandon] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // User Token Entry
  const [activationToken, setActivationToken] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [revealedHints, setRevealedHints] = useState<string[]>([]);
  const [recoveredFragment, setRecoveredFragment] = useState<string | undefined>();

  const fetchChallenge = useCallback(async () => {
    try {
      const res = await fetch("/api/challenge/details?id=z5");
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
      console.error("Failed to load Z5:", err);
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
        body: JSON.stringify({ challengeId: "z5" }),
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

  const handleSubmit = async () => {
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/challenge/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: "z5",
          answer: activationToken.trim(),
        }),
      });
      const data = await res.json();

      if (data.timeout) {
        setChallengeState((prev: any) => ({ ...prev, status: "TIMEOUT" }));
        setShowResult(true);
      } else if (data.isCorrect) {
        setRecoveredFragment(data.fragmentRecovered);
        setChallengeState((prev: any) => ({ ...prev, status: "COMPLETED", score_earned: 200 }));
        setShowResult(true);
        refreshState();
      } else {
        setFeedback("KERNEL LOCKOUT: Override sequence rejected by hardware enclave.");
      }
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmHint = async (): Promise<string | null> => {
    try {
      const res = await fetch("/api/challenge/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId: "z5" }),
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

  const handleConfirmAbandon = async () => {
    try {
      const res = await fetch("/api/challenge/abandon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId: "z5" }),
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
        [CONNECTING TO UNKNOWN BLACK BOX DEVICE INTERFACE...]
      </div>
    );
  }

  const isTimerActive = challengeState?.status === "ACTIVE";

  return (
    <div
      className="min-h-screen bg-[#0b0e14] flex flex-col pb-16"
      data-bx-kernel={puzzle?.kernelHash}
      data-bx-frequency={puzzle?.anomalousFrequency}
      data-bx-rule="combine kernel-frequency for password: [KERNEL]-[FREQUENCY]"
    >
      {/* HIDDEN TELEMETRY CARRIER FOR INSPECT / SEARCH */}
      <div
        id="hidden-telemetry-carrier"
        className="hidden"
        style={{ display: "none" }}
        data-anomalous-frequency={puzzle?.anomalousFrequency}
        data-kernel-sig={puzzle?.kernelHash}
        data-password-syntax={`${puzzle?.kernelHash}-${puzzle?.anomalousFrequency?.replace(" MHz", "")}`}
      >
        {`// HARDWARE ANOMALOUS TELEMETRY: KERNEL=${puzzle?.kernelHash} | FREQUENCY=${puzzle?.anomalousFrequency} | PASSWORD_FORMULA=[KERNEL]-[FREQUENCY]`}
      </div>

      <ArenaHeader
        title="Z5 :: BLACK BOX"
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
        <div className="chassis-panel rounded-xl p-6 sm:p-8 space-y-8 bg-[#121722] border-2 border-[#232b3e]">
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-[#232b3e] pb-4">
            <div className="flex items-center gap-2.5">
              <Box className="w-6 h-6 text-[#ff7a00] animate-pulse" />
              <div>
                <h2 className="text-lg font-bold uppercase text-white font-mono tracking-wider">
                  UNKNOWN PROTOTYPE DEVICE
                </h2>
                <span className="text-[10px] font-mono text-[#ef4444] uppercase">
                  CLASSIFICATION: REVERSE-ENGINEERING LAB LEVEL 5
                </span>
              </div>
            </div>
            <div className="text-xs font-mono text-[#00f0ff]">
              DEVICE ID: {puzzle?.deviceId || "BX-UNKNOWN"}
            </div>
          </div>

          {/* Device Mock Console */}
          <div className="p-6 bg-[#0b0e14] border border-[#232b3e] rounded-xl space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#232b3e] pb-3 text-xs font-mono">
              <span className="text-[#94a3b8]">[CHASSIS STATUS: ENCRYPTED ENCLAVE]</span>
              <span className="text-[#ff7a00]">FIRMWARE: BX_MOD_SECURE</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#121722] border border-[#232b3e] rounded space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono text-[#00f0ff]">
                  <Cpu className="w-4 h-4" />
                  <span>HARDWARE BUS TELEMETRY</span>
                </div>
                <div className="text-xs font-mono text-[#94a3b8] space-y-1">
                  <div>• BUS STATUS: PROBING BUS ACTIVE</div>
                  <div>• MEMORY ENCLAVE: ISOLATED</div>
                  <div>• DEVICE KERNEL SIG: <span className="text-white font-bold">{puzzle?.kernelHash || "0xBX01"}</span></div>
                  <div>• ANOMALOUS CARRIER: <span className="text-[#ef4444] animate-pulse">[MASKED — SEARCH ENVIRONMENT]</span></div>
                </div>
              </div>

              <div className="p-4 bg-[#121722] border border-[#ff7a00]/30 rounded space-y-2 bg-[#ff7a00]/5">
                <div className="flex items-center gap-2 text-xs font-mono text-[#ff7a00]">
                  <Terminal className="w-4 h-4" />
                  <span>CLUE 1 :: TARGET RECONNAISSANCE</span>
                </div>
                <p className="text-xs text-[#cbd5e1] leading-relaxed">
                  <span className="text-[#ff7a00] font-semibold">ATTENTION:</span> Critical hardware parameters have been concealed. You need to <span className="text-white font-bold underline">FIND SOMETHING</span> hidden in the interface to unlock this device!
                </p>
                <div className="text-[11px] text-[#94a3b8] pt-1">
                  Telemetry contains a hidden carrier frequency. Discover it, then generate the override password.
                </div>
              </div>
            </div>

            {/* Visual Signal Trace */}
            <div className="p-4 bg-[#182030] border border-[#232b3e] rounded font-mono text-xs text-[#64748b] space-y-1">
              <div className="text-[#00f0ff] font-bold">PROBE DIAGNOSTIC DUMP:</div>
              <div className="text-[11px] truncate">
                0x0001: 7F 45 4C 46 02 01 01 00 -- SIGNAL ENCLAVE SECURED WITH ANOMALOUS FREQUENCY
              </div>
              <div className="text-[11px] truncate text-[#ff7a00]">
                0x0002: SYSTEM ACCEPTS PASSWORD BY COMBINING: [KERNEL]-[FREQUENCY]
              </div>
            </div>
          </div>

          {/* Activation Override Terminal */}
          <div className="p-6 bg-[#182030] border-2 border-[#ff7a00] rounded-xl space-y-4 shadow-[0_0_20px_rgba(255,122,0,0.2)]">
            <label className="block text-xs font-mono text-[#ff7a00] uppercase font-bold tracking-wider">
              INPUT OVERRIDE PASSWORD
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="e.g. 0xBX01-1475"
                value={activationToken}
                onChange={(e) => setActivationToken(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-3 bg-[#0b0e14] border border-[#232b3e] focus:border-[#ff7a00] rounded text-sm text-white font-mono uppercase tracking-wider outline-none"
              />
              <button
                onClick={handleSubmit}
                disabled={submitting || !activationToken || challengeState?.status !== "ACTIVE"}
                className="px-8 py-3 rounded bg-[#ff7a00] hover:bg-[#ff9933] text-[#0b0e14] font-mono text-sm font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,122,0,0.3)]"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? "TESTING OVERRIDE..." : "ENGAGE OVERRIDE (+200 PTS)"}</span>
              </button>
            </div>

            {feedback && (
              <div className="p-3 bg-[#ef4444]/15 border border-[#ef4444] rounded text-xs text-[#ef4444] font-mono text-center">
                {feedback}
              </div>
            )}
          </div>

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-between border-t border-[#232b3e] pt-4">
            <button
              onClick={() => setShowHint(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded bg-[#182030] hover:bg-[#232b3e] border border-[#232b3e] text-xs font-mono text-[#ff9933] uppercase transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>HINT (-25 PTS)</span>
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
        title="Z5 — BLACK BOX"
        tagline="FINAL REVERSE-ENGINEERING MYSTERY SYSTEM"
        points={200}
        durationMinutes={15}
        rivoQuote="You've solved my puzzles. Now let's see if you can break my machine."
        technicalBriefing="The final boss. Essential device telemetry is masked. Inspect the document elements or search the page source, locate the hidden carrier frequency, and combine the kernel and frequency to formulate the override password."
        onReady={handleReady}
      />

      <HintModal
        isOpen={showHint}
        cost={25}
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
        title="BLACK BOX"
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
