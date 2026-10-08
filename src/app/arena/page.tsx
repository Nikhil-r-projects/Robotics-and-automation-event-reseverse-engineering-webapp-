"use client";

import React from "react";
import Link from "next/link";
import { ArenaHeader } from "@/components/shared/ArenaHeader";
import { RivoAvatar } from "@/components/shared/RivoAvatar";
import { useArenaSession } from "@/hooks/useArenaSession";
import {
  Lock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Zap,
  Activity,
  Radio,
  Sliders,
  Binary,
  Box,
  Trophy,
  ArrowRight,
} from "lucide-react";
import { ChallengeId } from "@/types/arena";

interface ZoneCardConfig {
  id: ChallengeId;
  name: string;
  code: string;
  points: number;
  timeLimit: string;
  icon: React.ElementType;
  route: string;
  tagline: string;
  skills: string;
}

const ZONES: ZoneCardConfig[] = [
  {
    id: "z1",
    name: "SIGNAL BREAKER",
    code: "ZONE_01",
    points: 50,
    timeLimit: "10 MIN",
    icon: Activity,
    route: "/arena/z1-signal-breaker",
    tagline: "Pattern recognition & harmonic waveform prediction",
    skills: "Bitwise Shift • Parity Cycle • Waveform Analysis",
  },
  {
    id: "z2",
    name: "DEAD SIGNAL",
    code: "ZONE_02",
    points: 50,
    timeLimit: "10 MIN",
    icon: Radio,
    route: "/arena/z2-dead-signal",
    tagline: "Carrier frequency audio interception & Morse decryption",
    skills: "Audio Synthesis • Morse Telemetry • Carrier Tuning",
  },
  {
    id: "z3",
    name: "LOGIC LOCK",
    code: "ZONE_03",
    points: 100,
    timeLimit: "10 MIN",
    icon: Sliders,
    route: "/arena/z3-logic-lock",
    tagline: "Two-stage positional riddle & 8-diode mystery matrix",
    skills: "Positional Logic • Invertible Parity Matrix • State Reverse",
  },
  {
    id: "z4",
    name: "BINARY VAULT",
    code: "ZONE_04",
    points: 200,
    timeLimit: "15 MIN",
    icon: Binary,
    route: "/arena/z4-binary-vault",
    tagline: "Multi-tier binary/hex conversion, riddle & master deciphering",
    skills: "Binary -> Hex • ASCII Conversion • Memory Verification",
  },
  {
    id: "z5",
    name: "BLACK BOX",
    code: "ZONE_05",
    points: 200,
    timeLimit: "15 MIN",
    icon: Box,
    route: "/arena/z5-black-box",
    tagline: "Final boss anomalous hardware reverse-engineering suite",
    skills: "DOM Forensics • Obfuscated State • Anomaly Override",
  },
];

export default function ArenaHubPage() {
  const { team, challenges, loading } = useArenaSession();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0e14] text-[#ff7a00] font-mono text-sm">
        [INITIALIZING MISSION HUB TELEMETRY...]
      </div>
    );
  }

  // Calculate unlock status
  const completedInitial = [
    challenges?.z1?.status === "COMPLETED",
    challenges?.z2?.status === "COMPLETED",
    challenges?.z3?.status === "COMPLETED",
  ].filter(Boolean).length;

  const totalAttempted = Object.values(challenges || {}).filter(
    (c) => c.status === "COMPLETED" || c.status === "TIMEOUT" || c.status === "ABANDONED"
  ).length;

  return (
    <div className="min-h-screen bg-[#0b0e14] flex flex-col pb-16">
      <ArenaHeader
        title="MISSION HUB"
        teamNumber={team?.team_number}
        teamName={team?.team_name}
        score={team?.total_score || 0}
        showBack={false}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full space-y-8">
        {/* Banner with Rivo Tactical Ping */}
        <div className="p-5 sm:p-6 bg-[#121722] border border-[#232b3e] rounded-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <RivoAvatar size={58} mood="curious" className="shrink-0" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#ff7a00] uppercase font-bold tracking-wider">
                  RIVO MISSION DISPATCH
                </span>
                <span className="text-[10px] font-mono text-[#64748b]">•</span>
                <span className="text-[10px] font-mono text-[#00f0ff]">
                  PROGRESS: {completedInitial}/2 FOR VAULT UNLOCK
                </span>
              </div>
              <p className="text-sm text-white font-medium">
                {completedInitial >= 2
                  ? "Security clearance elevated! Vault zones (Z4 & Z5) are now unlocked and active."
                  : "Complete any two of the initial three zones to breach the security locks on Z4 & Z5."}
              </p>
              <p className="text-xs text-[#94a3b8]">
                Remember: you can choose your strategy. Earned points from completed stages are permanent.
              </p>
            </div>
          </div>

          {totalAttempted >= 3 && (
            <Link
              href="/arena/results"
              className="flex items-center gap-2 py-2.5 px-4 rounded bg-[#182030] hover:bg-[#232b3e] border border-[#ff7a00]/40 text-xs font-mono font-bold text-[#ff7a00] uppercase tracking-wider transition-colors shrink-0"
            >
              <Trophy className="w-4 h-4" />
              <span>FINAL DEBRIEF</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Zones Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono uppercase tracking-widest text-[#94a3b8] flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#ff7a00]" />
              <span>ARENA TECHNICAL ZONES (600 PTS TOTAL)</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ZONES.map((zone) => {
              const ch = challenges ? challenges[zone.id] : null;
              const isLocked = ch?.status === "LOCKED";
              const isCompleted = ch?.status === "COMPLETED";
              const isTimeout = ch?.status === "TIMEOUT";
              const isAbandoned = ch?.status === "ABANDONED";
              const isActive = ch?.status === "ACTIVE";

              const Icon = zone.icon;

              return (
                <div
                  key={zone.id}
                  className={`chassis-panel rounded-lg p-5 flex flex-col justify-between transition-all duration-200 ${
                    isLocked
                      ? "opacity-60 bg-[#0e121a] border-[#1d2535]"
                      : isCompleted
                      ? "border-[#10b981]/50 bg-[#121722] hover:border-[#10b981]"
                      : isActive
                      ? "border-[#ff7a00] bg-[#182030] shadow-[0_0_20px_rgba(255,122,0,0.15)]"
                      : "hover:border-[#ff7a00]/70 hover:shadow-[0_0_15px_rgba(255,122,0,0.1)]"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top status bar */}
                    <div className="flex items-center justify-between border-b border-[#232b3e] pb-3">
                      <div className="flex items-center gap-2 text-xs font-mono text-[#94a3b8]">
                        <span className="text-[#ff7a00] font-bold">{zone.code}</span>
                      </div>
                      
                      {/* Status Badges */}
                      {isLocked && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#4b5563]/20 border border-[#4b5563] text-[10px] font-mono text-[#94a3b8]">
                          <Lock className="w-3 h-3" />
                          <span>LOCKED</span>
                        </div>
                      )}
                      {isCompleted && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#10b981]/15 border border-[#10b981] text-[10px] font-mono text-[#10b981]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>SOLVED</span>
                        </div>
                      )}
                      {isTimeout && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#ef4444]/15 border border-[#ef4444] text-[10px] font-mono text-[#ef4444]">
                          <AlertTriangle className="w-3 h-3" />
                          <span>TIMEOUT</span>
                        </div>
                      )}
                      {isAbandoned && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#f59e0b]/15 border border-[#f59e0b] text-[10px] font-mono text-[#f59e0b]">
                          <span>ABANDONED</span>
                        </div>
                      )}
                      {isActive && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#ff7a00]/15 border border-[#ff7a00] text-[10px] font-mono text-[#ff7a00] animate-pulse">
                          <span>IN PROGRESS</span>
                        </div>
                      )}
                      {!isLocked && !isCompleted && !isTimeout && !isAbandoned && !isActive && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#00f0ff]/10 border border-[#00f0ff]/50 text-[10px] font-mono text-[#00f0ff]">
                          <span>AVAILABLE</span>
                        </div>
                      )}
                    </div>

                    {/* Zone Info */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-5 h-5 text-[#ff7a00]" />
                        <h3 className="text-base font-bold text-white uppercase tracking-wide">
                          {zone.name}
                        </h3>
                      </div>
                      <p className="text-xs text-[#94a3b8] leading-relaxed">
                        {zone.tagline}
                      </p>
                    </div>

                    {/* Telemetry Stats */}
                    <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-mono">
                      <div className="p-2 bg-[#0b0e14] rounded border border-[#232b3e]">
                        <span className="text-[10px] text-[#64748b] block">POINTS</span>
                        <span className="text-white font-bold">{zone.points} PTS</span>
                      </div>
                      <div className="p-2 bg-[#0b0e14] rounded border border-[#232b3e]">
                        <span className="text-[10px] text-[#64748b] block">TIME LIMIT</span>
                        <span className="text-[#00f0ff] font-bold">{zone.timeLimit}</span>
                      </div>
                    </div>

                    <div className="text-[10px] font-mono text-[#64748b]">
                      SKILLS: {zone.skills}
                    </div>
                  </div>

                  {/* Action Link / Button */}
                  <div className="pt-5 border-t border-[#232b3e] mt-4">
                    {isLocked ? (
                      <div className="text-center py-2.5 px-4 rounded bg-[#0b0e14] border border-[#232b3e] text-xs font-mono text-[#64748b]">
                        COMPLETE ANY 2 INITIAL ZONES
                      </div>
                    ) : (
                      <Link
                        href={zone.route}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded text-xs font-mono font-bold uppercase tracking-wider transition-colors ${
                          isCompleted
                            ? "bg-[#182030] hover:bg-[#232b3e] text-[#10b981] border border-[#10b981]/30"
                            : "bg-[#ff7a00] hover:bg-[#ff9933] text-[#0b0e14] shadow-[0_0_12px_rgba(255,122,0,0.2)]"
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isCompleted ? "REVIEW INTEL" : isActive ? "RESUME ZONE" : "ENTER ZONE"}</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
