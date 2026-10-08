"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, Trophy, Clock, Target, HelpCircle, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";
import { RivoAvatar } from "./RivoAvatar";

interface ChallengeResultModalProps {
  isOpen: boolean;
  title: string;
  pointsEarned: number;
  maxPoints: number;
  timeUsedFormatted?: string;
  attempts: number;
  hintsUsed: number;
  fragmentRecovered?: string;
  isTimeout?: boolean;
  isAbandoned?: boolean;
}

export const ChallengeResultModal: React.FC<ChallengeResultModalProps> = ({
  isOpen,
  title,
  pointsEarned,
  maxPoints,
  timeUsedFormatted = "--:--",
  attempts,
  hintsUsed,
  fragmentRecovered,
  isTimeout = false,
  isAbandoned = false,
}) => {
  useEffect(() => {
    if (isOpen && !isTimeout && !isAbandoned) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#ff7a00", "#00f0ff", "#10b981"],
      });
    }
  }, [isOpen, isTimeout, isAbandoned]);

  if (!isOpen) return null;

  const isSuccess = !isTimeout && !isAbandoned;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-lg bg-[#121722] border border-[#232b3e] rounded-lg shadow-2xl overflow-hidden p-6 space-y-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <RivoAvatar size={72} mood={isSuccess ? "success" : "alert"} />
          
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-[#ff7a00]">
              [MISSION DEBRIEF]
            </span>
            <h2 className="text-2xl font-bold uppercase tracking-wide text-white">
              {isSuccess
                ? "CHALLENGE COMPLETE"
                : isTimeout
                ? "TIME LIMIT ELAPSED"
                : "ZONE FORFEITED"}
            </h2>
            <p className="text-xs font-mono text-[#94a3b8] uppercase">
              {title}
            </p>
          </div>
        </div>

        {/* Telemetry Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 bg-[#0b0e14] border border-[#232b3e] rounded flex items-center gap-3">
            <Trophy className="w-5 h-5 text-[#ff7a00]" />
            <div>
              <div className="text-[10px] font-mono text-[#94a3b8] uppercase">POINTS EARNED</div>
              <div className="text-base font-bold font-mono text-white">
                {pointsEarned} <span className="text-xs font-normal text-[#94a3b8]">/ {maxPoints}</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-[#0b0e14] border border-[#232b3e] rounded flex items-center gap-3">
            <Clock className="w-5 h-5 text-[#00f0ff]" />
            <div>
              <div className="text-[10px] font-mono text-[#94a3b8] uppercase">TIME DURATION</div>
              <div className="text-base font-bold font-mono text-white">
                {timeUsedFormatted}
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-[#0b0e14] border border-[#232b3e] rounded flex items-center gap-3">
            <Target className="w-5 h-5 text-[#10b981]" />
            <div>
              <div className="text-[10px] font-mono text-[#94a3b8] uppercase">ATTEMPTS</div>
              <div className="text-base font-bold font-mono text-white">
                {attempts}
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-[#0b0e14] border border-[#232b3e] rounded flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-[#f59e0b]" />
            <div>
              <div className="text-[10px] font-mono text-[#94a3b8] uppercase">HINTS BURNED</div>
              <div className="text-base font-bold font-mono text-white">
                {hintsUsed}
              </div>
            </div>
          </div>
        </div>

        {/* Fragment Recovered */}
        {fragmentRecovered && (
          <div className="p-3 bg-[#10b981]/10 border border-[#10b981]/40 rounded text-center space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#10b981]">
              [SECURITY CIPHER FRAGMENT RECOVERED]
            </div>
            <div className="font-mono text-base font-bold tracking-widest text-white">
              {fragmentRecovered}
            </div>
          </div>
        )}

        {/* Return Button */}
        <div className="pt-2">
          <Link
            href="/arena"
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded bg-[#ff7a00] hover:bg-[#ff9933] text-[#0b0e14] font-mono text-sm font-bold uppercase tracking-wider transition-colors shadow-[0_0_15px_rgba(255,122,0,0.25)]"
          >
            <span>RETURN TO ARENA</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
