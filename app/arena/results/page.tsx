"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { ArenaHeader } from "@/components/shared/ArenaHeader";
import { RivoAvatar } from "@/components/shared/RivoAvatar";
import { useArenaSession } from "@/hooks/useArenaSession";
import { Trophy, CheckCircle2, Clock, Zap, ArrowLeft, Shield } from "lucide-react";
import confetti from "canvas-confetti";

export default function ResultsPage() {
  const { team, challenges, loading } = useArenaSession();

  useEffect(() => {
    if (!loading && team) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ["#ff7a00", "#00f0ff", "#10b981"],
      });
    }
  }, [loading, team]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0e14] text-[#ff7a00] font-mono text-sm">
        [COMPILING FINAL TELEMETRY SCOREBOARD...]
      </div>
    );
  }

  const zones = [
    { id: "z1", name: "Z1 — SIGNAL BREAKER", max: 50 },
    { id: "z2", name: "Z2 — DEAD SIGNAL", max: 50 },
    { id: "z3", name: "Z3 — LOGIC LOCK", max: 100 },
    { id: "z4", name: "Z4 — BINARY VAULT", max: 200 },
    { id: "z5", name: "Z5 — BLACK BOX", max: 200 },
  ] as const;

  return (
    <div className="min-h-screen bg-[#0b0e14] flex flex-col pb-16">
      <ArenaHeader
        title="ARENA DEBRIEF"
        teamNumber={team?.team_number}
        teamName={team?.team_name}
        score={team?.total_score || 0}
        showBack={true}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 w-full space-y-8">
        <div className="chassis-panel rounded-2xl p-6 sm:p-10 space-y-8 bg-[#121722] border border-[#232b3e] text-center">
          <div className="flex justify-center">
            <RivoAvatar size={96} mood="success" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#ff7a00] font-bold">
              [OPERATION CONCLUDED :: DEBRIEF]
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold uppercase text-white tracking-wide">
              ARENA COMPLETE
            </h1>
            <div className="flex items-center justify-center gap-2 text-sm font-mono text-[#00f0ff]">
              <Shield className="w-4 h-4" />
              <span>TEAM {team?.team_number} • {team?.team_name}</span>
            </div>
          </div>

          {/* Big Score Card */}
          <div className="p-6 bg-[#0b0e14] border-2 border-[#ff7a00] rounded-xl max-w-sm mx-auto space-y-1 shadow-[0_0_30px_rgba(255,122,0,0.2)]">
            <div className="text-xs font-mono uppercase text-[#94a3b8]">FINAL COMPETITION SCORE</div>
            <div className="text-4xl sm:text-5xl font-black font-mono text-white tracking-wider">
              {team?.total_score || 0}{" "}
              <span className="text-xl font-normal text-[#94a3b8]">/ 600</span>
            </div>
          </div>

          {/* Zone Breakdown Table */}
          <div className="space-y-3 text-left">
            <span className="text-xs font-mono text-[#94a3b8] uppercase tracking-wider block text-center">
              ZONE SCORING BREAKDOWN
            </span>

            <div className="space-y-2">
              {zones.map((z) => {
                const ch = challenges ? challenges[z.id] : null;
                const earned = ch?.score_earned || 0;
                const isComplete = ch?.status === "COMPLETED";

                return (
                  <div
                    key={z.id}
                    className="p-3.5 bg-[#0b0e14] border border-[#232b3e] rounded-lg flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-2 text-white font-semibold">
                      {isComplete ? (
                        <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-[#64748b] inline-block" />
                      )}
                      <span>{z.name}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-[#64748b]">STATUS: {ch?.status || "NOT ATTEMPTED"}</span>
                      <span className="text-white font-bold w-20 text-right">
                        {earned} / {z.max} PTS
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Final Rivo Quote */}
          <div className="p-5 bg-[#182030] border-l-4 border-[#10b981] rounded-r-lg text-sm text-[#e2e8f0] italic leading-relaxed text-left">
            &ldquo;Incredible work, engineers! You tackled the signal sequences, carrier waves, mystery button logic, memory hex dumps, and the Black Box anomaly. Your records are filed with the tournament committee.&rdquo; — Rivo
          </div>

          <div className="pt-4">
            <Link
              href="/arena"
              className="inline-flex items-center gap-2 py-3 px-8 rounded bg-[#182030] hover:bg-[#232b3e] border border-[#232b3e] hover:border-[#ff7a00] text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>RETURN TO MISSION HUB</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
