"use client";

import React from "react";
import { RivoAvatar } from "./RivoAvatar";
import { Terminal, Play } from "lucide-react";

interface RivoBriefingModalProps {
  isOpen: boolean;
  title: string;
  tagline: string;
  points: number;
  durationMinutes: number;
  rivoQuote: string;
  technicalBriefing: string;
  onReady: () => void;
  isLoading?: boolean;
}

export const RivoBriefingModal: React.FC<RivoBriefingModalProps> = ({
  isOpen,
  title,
  tagline,
  points,
  durationMinutes,
  rivoQuote,
  technicalBriefing,
  onReady,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-[#121722] border border-[#232b3e] rounded-lg shadow-[0_0_30px_rgba(255,122,0,0.15)] overflow-hidden">
        {/* Top telemetry bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#0b0e14] border-b border-[#232b3e]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ff7a00] animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#94a3b8]">
              [MISSION_BRIEFING :: {title}]
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-[#00f0ff]">
            <span>{points} PTS</span>
            <span>•</span>
            <span>{durationMinutes} MINS</span>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Header Title */}
          <div>
            <h2 className="text-xl font-bold uppercase text-white tracking-wide">
              {title}
            </h2>
            <p className="text-xs font-mono text-[#ff7a00] uppercase mt-0.5">
              {tagline}
            </p>
          </div>

          {/* Rivo Speech Card */}
          <div className="flex items-start gap-4 p-4 rounded bg-[#182030] border-l-4 border-[#ff7a00] border-y border-r border-[#232b3e]">
            <RivoAvatar size={68} mood="speaking" className="shrink-0" />
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-[#ff9933] uppercase font-bold tracking-wider">
                RIVO COMPANION DIAGNOSTICS:
              </span>
              <p className="text-sm text-[#e2e8f0] italic leading-relaxed">
                &ldquo;{rivoQuote}&rdquo;
              </p>
            </div>
          </div>

          {/* Technical Directive */}
          <div className="p-3.5 bg-[#0b0e14] rounded border border-[#232b3e] space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono text-[#00f0ff]">
              <Terminal className="w-3.5 h-3.5" />
              <span>TECHNICAL PROTOCOL</span>
            </div>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              {technicalBriefing}
            </p>
          </div>

          {/* Ready Button */}
          <div className="pt-2">
            <button
              onClick={onReady}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded bg-[#ff7a00] hover:bg-[#ff9933] text-[#0b0e14] font-mono text-sm font-bold uppercase tracking-wider transition-all duration-200 shadow-[0_0_15px_rgba(255,122,0,0.3)] disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isLoading ? "INITIALIZING TELEMETRY..." : "I'M READY — START CLOCK"}</span>
            </button>
            <p className="text-[10px] font-mono text-center text-[#64748b] mt-2">
              TIMER WILL INITIATE UPON CONFIRMATION. LEAVING THIS SCREEN MAY RESULT IN LOCKOUT.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
