"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Zap } from "lucide-react";
import { RasLogo } from "./RasLogo";
import { ServerTimer } from "./ServerTimer";

interface ArenaHeaderProps {
  title?: string;
  teamNumber?: string;
  teamName?: string;
  score?: number;
  remainingSeconds?: number;
  timerActive?: boolean;
  onTimerExpire?: () => void;
  showBack?: boolean;
}

export const ArenaHeader: React.FC<ArenaHeaderProps> = ({
  title,
  teamNumber,
  teamName,
  score = 0,
  remainingSeconds = 0,
  timerActive = false,
  onTimerExpire,
  showBack = true,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0b0e14]/90 backdrop-blur-md border-b border-[#232b3e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Back / Title / Logo */}
        <div className="flex items-center gap-4">
          {showBack && (
            <Link
              href="/arena"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#182030] border border-[#232b3e] text-xs font-mono text-[#94a3b8] hover:text-white hover:border-[#ff7a00] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>ARENA</span>
            </Link>
          )}

          <div className="flex items-center gap-2.5">
            <RasLogo size={28} />
            <div>
              <h1 className="text-sm font-semibold tracking-wide text-white uppercase flex items-center gap-2">
                {title || "MISSION HUB"}
              </h1>
              <span className="text-[10px] font-mono text-[#ff7a00] uppercase tracking-wider">
                REVERSE ENGINEER THIS
              </span>
            </div>
          </div>
        </div>

        {/* Right: Team info, live score, timer */}
        <div className="flex items-center gap-3 sm:gap-5">
          {teamNumber && (
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-[#121722] border border-[#232b3e]">
              <Shield className="w-3.5 h-3.5 text-[#00f0ff]" />
              <span className="font-mono text-xs text-[#e2e8f0]">
                T{teamNumber} : <span className="text-white font-medium">{teamName}</span>
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#121722] border border-[#ff7a00]/30 shadow-[0_0_10px_rgba(255,122,0,0.1)]">
            <Zap className="w-3.5 h-3.5 text-[#ff7a00]" />
            <span className="font-mono text-xs text-[#94a3b8]">SCORE</span>
            <span className="font-mono text-sm font-bold text-white tracking-wide">
              {score}
            </span>
          </div>

          {remainingSeconds > 0 && (
            <ServerTimer
              initialSeconds={remainingSeconds}
              isActive={timerActive}
              onExpire={onTimerExpire}
            />
          )}
        </div>
      </div>
    </header>
  );
};
