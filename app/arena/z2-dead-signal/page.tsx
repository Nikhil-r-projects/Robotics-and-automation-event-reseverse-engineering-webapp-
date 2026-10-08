"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArenaHeader } from "@/components/shared/ArenaHeader";
import { RivoBriefingModal } from "@/components/shared/RivoBriefingModal";
import { HintModal } from "@/components/shared/HintModal";
import { AbandonModal } from "@/components/shared/AbandonModal";
import { ChallengeResultModal } from "@/components/shared/ChallengeResultModal";
import { useArenaSession } from "@/hooks/useArenaSession";
import { textToMorse } from "@/lib/challenges/seedGenerator";
import { Radio, Volume2, VolumeX, Play, Send, HelpCircle, AlertOctagon, Terminal } from "lucide-react";

interface Z2Payload {
  channel1Word: string;
  channel2Word: string;
  unknownMorse: string;
  wordLength: number;
}

export default function DeadSignalPage() {
  const router = useRouter();
  const { team, refreshState } = useArenaSession();

  const [loading, setLoading] = useState(true);
  const [challengeState, setChallengeState] = useState<any>(null);
  const [puzzle, setPuzzle] = useState<Z2Payload | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // Modals
  const [showIntro, setShowIntro] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showAbandon, setShowAbandon] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Audio Playback
  const [activeChannel, setActiveChannel] = useState<"ch1" | "ch2" | "unknown" | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<"slow" | "very_slow" | "normal">("slow");
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeOscillatorsRef = useRef<OscillatorNode[]>([]);
  const playbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Input & Submit
  const [userDecodedText, setUserDecodedText] = useState("");
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [revealedHints, setRevealedHints] = useState<string[]>([]);

  const fetchChallenge = useCallback(async () => {
    try {
      const res = await fetch("/api/challenge/details?id=z2");
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
      console.error("Failed to load Z2:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchChallenge();
  }, [fetchChallenge]);

  // Handle Ready click
  const handleReady = async () => {
    try {
      const res = await fetch("/api/challenge/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId: "z2" }),
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

  // Stop active Morse audio playback
  const stopAudio = () => {
    activeOscillatorsRef.current.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    activeOscillatorsRef.current = [];
    if (playbackTimeoutRef.current) {
      clearTimeout(playbackTimeoutRef.current);
      playbackTimeoutRef.current = null;
    }
    setIsPlayingAudio(false);
    setActiveChannel(null);
  };

  // Play Morse Code via Web Audio API Pure Oscillator with Relaxed Transcribing Timing
  const playMorseAudio = async (morseString: string, channel: "ch1" | "ch2" | "unknown") => {
    if (isPlayingAudio) {
      stopAudio();
      if (activeChannel === channel) {
        return; // Clicking same active channel toggles it off
      }
    }

    setActiveChannel(channel);
    setIsPlayingAudio(true);
    activeOscillatorsRef.current = [];

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      // Timing tuned for human transcription by ear:
      // "slow" (default): 160ms dot, 480ms dash, 650ms pause between letters so participants can take notes.
      let dotDuration = 0.16; // 160ms (Comfortable slow transcription)
      let letterGap = 0.65;   // 650ms distinct gap between letters
      if (playbackSpeed === "very_slow") {
        dotDuration = 0.22;   // 220ms
        letterGap = 0.85;     // 850ms
      } else if (playbackSpeed === "normal") {
        dotDuration = 0.10;   // 100ms
        letterGap = 0.40;     // 400ms
      }

      const dashDuration = dotDuration * 3;
      const elementGap = dotDuration;
      const freq = channel === "ch1" ? 750 : channel === "ch2" ? 850 : 650;

      let currentTime = ctx.currentTime + 0.05;

      for (let i = 0; i < morseString.length; i++) {
        const char = morseString[i];
        if (char === ".") {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, currentTime);
          gain.gain.setValueAtTime(0.2, currentTime);
          gain.gain.setValueAtTime(0, currentTime + dotDuration);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(currentTime);
          osc.stop(currentTime + dotDuration);
          activeOscillatorsRef.current.push(osc);
          currentTime += dotDuration + elementGap;
        } else if (char === "-") {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, currentTime);
          gain.gain.setValueAtTime(0.2, currentTime);
          gain.gain.setValueAtTime(0, currentTime + dashDuration);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(currentTime);
          osc.stop(currentTime + dashDuration);
          activeOscillatorsRef.current.push(osc);
          currentTime += dashDuration + elementGap;
        } else if (char === " ") {
          currentTime += letterGap;
        }
      }

      const totalWaitMs = Math.max(0, (currentTime - ctx.currentTime) * 1000);
      playbackTimeoutRef.current = setTimeout(() => {
        setIsPlayingAudio(false);
        setActiveChannel(null);
        activeOscillatorsRef.current = [];
      }, totalWaitMs);
    } catch (err) {
      console.error("Audio playback error:", err);
      setIsPlayingAudio(false);
      setActiveChannel(null);
    }
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
          challengeId: "z2",
          answer: userDecodedText.trim().toUpperCase(),
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
        setSubmissionFeedback("Decryption failed. The decoded word does not match transmission parity.");
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
        body: JSON.stringify({ challengeId: "z2" }),
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
        body: JSON.stringify({ challengeId: "z2" }),
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
        [TUNING CARRIER FREQUENCIES...]
      </div>
    );
  }

  const isTimerActive = challengeState?.status === "ACTIVE";

  return (
    <div className="min-h-screen bg-[#0b0e14] flex flex-col pb-16">
      <ArenaHeader
        title="Z2 :: DEAD SIGNAL"
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
              <Radio className="w-5 h-5 text-[#00f0ff] animate-pulse" />
              <h2 className="text-base font-bold uppercase text-white font-mono tracking-wider">
                TRANSMISSION INTERCEPTION TERMINAL
              </h2>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-[#64748b]">MODULATION: CW/RF</span>
              <span className="text-[#10b981]">SIGNAL: LOCKED (98%)</span>
            </div>
          </div>

          {/* Playback Speed Controller */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#0b0e14] border border-[#232b3e] rounded-lg">
            <div className="flex items-center gap-2 text-xs font-mono text-[#94a3b8]">
              <Volume2 className="w-4 h-4 text-[#00f0ff]" />
              <span className="text-[#00f0ff] font-bold">TRANSCRIBING SPEED:</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setPlaybackSpeed("slow");
                  if (isPlayingAudio) stopAudio();
                }}
                className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                  playbackSpeed === "slow"
                    ? "bg-[#ff7a00] text-[#0b0e14] font-bold shadow-[0_0_10px_rgba(255,122,0,0.3)]"
                    : "bg-[#182030] text-[#94a3b8] hover:text-white border border-[#232b3e]"
                }`}
              >
                ● SLOW / TRANSCRIBE (RECOMMENDED)
              </button>
              <button
                type="button"
                onClick={() => {
                  setPlaybackSpeed("very_slow");
                  if (isPlayingAudio) stopAudio();
                }}
                className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                  playbackSpeed === "very_slow"
                    ? "bg-[#ff7a00] text-[#0b0e14] font-bold shadow-[0_0_10px_rgba(255,122,0,0.3)]"
                    : "bg-[#182030] text-[#94a3b8] hover:text-white border border-[#232b3e]"
                }`}
              >
                VERY SLOW (EASIEST)
              </button>
              <button
                type="button"
                onClick={() => {
                  setPlaybackSpeed("normal");
                  if (isPlayingAudio) stopAudio();
                }}
                className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                  playbackSpeed === "normal"
                    ? "bg-[#ff7a00] text-[#0b0e14] font-bold shadow-[0_0_10px_rgba(255,122,0,0.3)]"
                    : "bg-[#182030] text-[#94a3b8] hover:text-white border border-[#232b3e]"
                }`}
              >
                NORMAL (FAST)
              </button>
            </div>
          </div>

          {/* Three Carrier Transmission Channels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Channel 1 (Known Reference) */}
            <div className="p-4 bg-[#0b0e14] border border-[#232b3e] rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#94a3b8]">CHANNEL 01 [REF]</span>
                <span className="text-[10px] font-mono text-[#10b981]">750 Hz</span>
              </div>
              <div className="font-mono text-sm font-bold text-white tracking-widest">
                {puzzle?.channel1Word}
              </div>
              <button
                type="button"
                onClick={() =>
                  playMorseAudio(textToMorse(puzzle?.channel1Word || "ALPHA"), "ch1")
                }
                className={`w-full py-2 px-3 rounded border text-xs font-mono flex items-center justify-center gap-2 transition-colors ${
                  isPlayingAudio && activeChannel === "ch1"
                    ? "bg-[#ef4444]/20 border-[#ef4444] text-[#ef4444]"
                    : "bg-[#182030] hover:bg-[#232b3e] border-[#232b3e] text-[#00f0ff]"
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>
                  {isPlayingAudio && activeChannel === "ch1" ? "■ STOP PLAYBACK" : "PLAY REFERENCE"}
                </span>
              </button>
            </div>

            {/* Channel 2 (Known Reference) */}
            <div className="p-4 bg-[#0b0e14] border border-[#232b3e] rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#94a3b8]">CHANNEL 02 [REF]</span>
                <span className="text-[10px] font-mono text-[#10b981]">850 Hz</span>
              </div>
              <div className="font-mono text-sm font-bold text-white tracking-widest">
                {puzzle?.channel2Word}
              </div>
              <button
                type="button"
                onClick={() =>
                  playMorseAudio(textToMorse(puzzle?.channel2Word || "DELTA"), "ch2")
                }
                className={`w-full py-2 px-3 rounded border text-xs font-mono flex items-center justify-center gap-2 transition-colors ${
                  isPlayingAudio && activeChannel === "ch2"
                    ? "bg-[#ef4444]/20 border-[#ef4444] text-[#ef4444]"
                    : "bg-[#182030] hover:bg-[#232b3e] border-[#232b3e] text-[#00f0ff]"
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>
                  {isPlayingAudio && activeChannel === "ch2" ? "■ STOP PLAYBACK" : "PLAY REFERENCE"}
                </span>
              </button>
            </div>

            {/* UNKNOWN TRANSMISSION */}
            <div className="p-4 bg-[#182030] border-2 border-[#ff7a00] rounded-lg space-y-3 shadow-[0_0_15px_rgba(255,122,0,0.15)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#ff7a00] font-bold">UNKNOWN SIGNAL</span>
                <span className="text-[10px] font-mono text-[#ff9933]">650 Hz</span>
              </div>
              <div className="font-mono text-sm text-[#94a3b8] tracking-widest">
                [??????] • {puzzle?.wordLength} LETTERS
              </div>
              <button
                type="button"
                onClick={() =>
                  playMorseAudio(puzzle?.unknownMorse || "", "unknown")
                }
                className={`w-full py-2 px-3 rounded text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors shadow-[0_0_10px_rgba(255,122,0,0.3)] ${
                  isPlayingAudio && activeChannel === "unknown"
                    ? "bg-[#ef4444] hover:bg-[#dc2626] text-white"
                    : "bg-[#ff7a00] hover:bg-[#ff9933] text-[#0b0e14]"
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>
                  {isPlayingAudio && activeChannel === "unknown"
                    ? "■ STOP TRANSMISSION"
                    : "▶ LISTEN UNKNOWN"}
                </span>
              </button>
            </div>
          </div>

          {/* Emergency Morse Reference Table */}
          <div className="p-4 bg-[#0b0e14] border border-[#232b3e] rounded-lg space-y-2">
            <div className="flex flex-wrap items-center justify-between text-xs font-mono text-[#94a3b8] gap-2">
              <span className="text-[#ff7a00] font-bold">MIL-STD EMERGENCY MORSE CIPHER TABLE</span>
              <span className="text-[#00f0ff]">
                {playbackSpeed === "slow" && "SPEED: SLOW (TRANSCRIBING MODE) • DOT: 160ms • DASH: 480ms • LETTER PAUSE: 650ms"}
                {playbackSpeed === "very_slow" && "SPEED: VERY SLOW • DOT: 220ms • DASH: 660ms • LETTER PAUSE: 850ms"}
                {playbackSpeed === "normal" && "SPEED: NORMAL • DOT: 100ms • DASH: 300ms • LETTER PAUSE: 400ms"}
              </span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 text-[11px] font-mono text-[#e2e8f0] pt-1">
              <div>A: <span className="text-[#00f0ff]">.-</span></div>
              <div>B: <span className="text-[#00f0ff]">-...</span></div>
              <div>C: <span className="text-[#00f0ff]">-.-.</span></div>
              <div>D: <span className="text-[#00f0ff]">-..</span></div>
              <div>E: <span className="text-[#00f0ff]">.</span></div>
              <div>F: <span className="text-[#00f0ff]">..-.</span></div>
              <div>G: <span className="text-[#00f0ff]">--.</span></div>
              <div>H: <span className="text-[#00f0ff]">....</span></div>
              <div>I: <span className="text-[#00f0ff]">..</span></div>
              <div>J: <span className="text-[#00f0ff]">.---</span></div>
              <div>K: <span className="text-[#00f0ff]">-.-</span></div>
              <div>L: <span className="text-[#00f0ff]">.-..</span></div>
              <div>M: <span className="text-[#00f0ff]">--</span></div>
              <div>N: <span className="text-[#00f0ff]">-.</span></div>
              <div>O: <span className="text-[#00f0ff]">---</span></div>
              <div>P: <span className="text-[#00f0ff]">.--.</span></div>
              <div>Q: <span className="text-[#00f0ff]">--.-</span></div>
              <div>R: <span className="text-[#00f0ff]">.-.</span></div>
              <div>S: <span className="text-[#00f0ff]">...</span></div>
              <div>T: <span className="text-[#00f0ff]">-</span></div>
              <div>U: <span className="text-[#00f0ff]">..-</span></div>
              <div>V: <span className="text-[#00f0ff]">...-</span></div>
              <div>W: <span className="text-[#00f0ff]">.--</span></div>
              <div>X: <span className="text-[#00f0ff]">-..-</span></div>
              <div>Y: <span className="text-[#00f0ff]">-.--</span></div>
              <div>Z: <span className="text-[#00f0ff]">--..</span></div>
            </div>
          </div>

          {/* Decryption Input Console */}
          <div className="p-6 bg-[#182030] border border-[#232b3e] rounded-xl space-y-4">
            <label className="block text-xs font-mono text-[#ff7a00] uppercase font-bold tracking-wider">
              ENTER DECODED WORD TRANSMISSION
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="e.g. VECTOR"
                value={userDecodedText}
                onChange={(e) => setUserDecodedText(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-3 bg-[#0b0e14] border border-[#232b3e] focus:border-[#ff7a00] focus:ring-1 focus:ring-[#ff7a00] rounded text-base text-white font-mono uppercase tracking-widest outline-none"
              />
              <button
                onClick={handleSubmit}
                disabled={submitting || !userDecodedText || challengeState?.status !== "ACTIVE"}
                className="px-6 py-3 rounded bg-[#ff7a00] hover:bg-[#ff9933] text-[#0b0e14] font-mono text-sm font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,122,0,0.25)]"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? "DECRYPTING..." : "SUBMIT DECRYPTION"}</span>
              </button>
            </div>

            {submissionFeedback && (
              <div className="p-3 bg-[#ef4444]/15 border border-[#ef4444] rounded text-xs text-[#ef4444] font-mono text-center">
                {submissionFeedback}
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

      {/* Modals */}
      <RivoBriefingModal
        isOpen={showIntro}
        title="Z2 — DEAD SIGNAL"
        tagline="CARRIER AUDIO INTERCEPTION & MORSE DECRYPTION"
        points={50}
        durationMinutes={10}
        rivoQuote="I've intercepted a transmission. Two signals are known. The third one... isn't."
        technicalBriefing="Use the audio synthesizer to listen to the reference signals on Channel 01 and 02. Decode the unknown transmission pulses using the emergency Morse table."
        onReady={handleReady}
      />

      <HintModal
        isOpen={showHint}
        cost={10}
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
        title="DEAD SIGNAL"
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
