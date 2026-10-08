"use client";

import React from "react";
import Link from "next/link";
import { RivoAvatar } from "@/components/shared/RivoAvatar";
import { RasLogo } from "@/components/shared/RasLogo";
import { ArrowRight, Terminal, Cpu, ShieldCheck } from "lucide-react";
import { useArenaSession } from "@/hooks/useArenaSession";

export default function RivoIntroPage() {
  const { team, loading } = useArenaSession();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0e14] text-[#ff7a00] font-mono text-sm">
        [INITIALIZING COMPANION DIAGNOSTICS...]
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#0b0e14] technical-grid">
      <div className="w-full max-w-2xl bg-[#121722] border border-[#232b3e] rounded-xl shadow-[0_0_50px_rgba(255,122,0,0.15)] overflow-hidden">
        {/* Top Header telemetry */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#0b0e14] border-b border-[#232b3e]">
          <div className="flex items-center gap-2.5">
            <RasLogo size={24} />
            <span className="text-xs font-mono text-white font-semibold tracking-wider">
              RAS DIGITAL ARENA
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#00f0ff]">
            <ShieldCheck className="w-4 h-4 text-[#10b981]" />
            <span>SESSION VERIFIED :: T{team?.team_number || "00"}</span>
          </div>
        </div>

        {/* Cinematic Rivo Core */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <RivoAvatar size={96} mood="speaking" className="animate-bounce" />

            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#ff7a00] font-bold">
                [SYSTEM INTRO :: RIVO]
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold uppercase text-white tracking-wide">
                &ldquo;Hey, mates! I&apos;m Rivo.&rdquo;
              </h1>
            </div>
          </div>

          {/* Rivo Speech Card */}
          <div className="p-5 bg-[#182030] border-l-4 border-[#ff7a00] border-y border-r border-[#232b3e] rounded-r-lg space-y-3">
            <p className="text-sm sm:text-base text-[#e2e8f0] leading-relaxed">
              &ldquo;Remember my name — you&apos;ll definitely need it later. Welcome to the
              <strong className="text-white"> RAS Digital Arena</strong>. Five reverse-engineering
              zones are waiting. Crack each system, collect your points, and let&apos;s see who can
              reverse-engineer their way to the top!&rdquo;
            </p>
            <p className="text-sm sm:text-base text-[#ff9933] italic leading-relaxed font-mono">
              &ldquo;Good luck, engineers. Don&apos;t make me regret giving you access.&rdquo;
            </p>
          </div>

          {/* Rules Summary Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-[#0b0e14] border border-[#232b3e] rounded space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-[#00f0ff]">
                <Cpu className="w-4 h-4" />
                <span>5 TECHNICAL ZONES</span>
              </div>
              <p className="text-xs text-[#94a3b8]">
                600 Points maximum. Complete any 2 initial zones to breach the high-security vaults (Z4 & Z5).
              </p>
            </div>

            <div className="p-3.5 bg-[#0b0e14] border border-[#232b3e] rounded space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-[#ff7a00]">
                <Terminal className="w-4 h-4" />
                <span>TIMERS ARE ACTIVE</span>
              </div>
              <p className="text-xs text-[#94a3b8]">
                Challenge clocks start only when you confirm readiness. Leaving the browser tab may trigger lockout.
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <Link
              href="/arena"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded bg-[#ff7a00] hover:bg-[#ff9933] text-[#0b0e14] font-mono text-sm font-bold uppercase tracking-wider transition-all duration-200 shadow-[0_0_20px_rgba(255,122,0,0.3)]"
            >
              <span>ENTER MISSION HUB</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
