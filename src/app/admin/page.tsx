"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RasLogo } from "@/components/shared/RasLogo";
import {
  ShieldAlert,
  Zap,
  RefreshCw,
  PlusCircle,
  RotateCcw,
  KeyRound,
  AlertTriangle,
  History,
  CheckCircle2,
} from "lucide-react";
import { Team, ChallengeId } from "@/types/arena";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [challenges, setChallenges] = useState<any>({});
  const [scoreEvents, setScoreEvents] = useState<any[]>([]);
  const [violations, setViolations] = useState<any[]>([]);
  const [continuationCodes, setContinuationCodes] = useState<any[]>([]);

  // Generated code modal
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [targetTeamName, setTargetTeamName] = useState<string>("");

  // Score adjustment modal
  const [adjustTeamId, setAdjustTeamId] = useState<string | null>(null);
  const [adjustDelta, setAdjustDelta] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState<string>("");

  const fetchLive = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/live");
      if (!res.ok) {
        router.replace("/admin/login");
        return;
      }
      const data = await res.json();
      if (data.success) {
        setTeams(data.teams || []);
        setChallenges(data.challenges || {});
        setScoreEvents(data.recentScoreEvents || []);
        setViolations(data.recentViolations || []);
        setContinuationCodes(data.continuationCodes || []);
      }
    } catch (err) {
      console.error("Failed to load admin live:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchLive();
    const interval = setInterval(fetchLive, 5000); // 5s live polling
    return () => clearInterval(interval);
  }, [fetchLive]);

  // Generate Continuation Code
  const handleGenerateCode = async (teamId: string, teamName: string) => {
    try {
      const res = await fetch("/api/admin/continuation-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId }),
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedCode(data.code);
        setTargetTeamName(teamName);
        fetchLive();
      }
    } catch (err) {
      console.error("Code gen error:", err);
    }
  };

  // Adjust Score
  const handleScoreAdjust = async () => {
    if (!adjustTeamId) return;
    try {
      const res = await fetch("/api/admin/score-adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: adjustTeamId,
          delta: adjustDelta,
          reason: adjustReason || "Organizer manual adjustment",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAdjustTeamId(null);
        setAdjustReason("");
        fetchLive();
      }
    } catch (err) {
      console.error("Score adjust error:", err);
    }
  };

  // Reset Challenge
  const handleResetChallenge = async (teamId: string, challengeId: ChallengeId) => {
    if (!confirm(`Are you sure you want to reset ${challengeId.toUpperCase()} for this team?`)) return;
    try {
      const res = await fetch("/api/admin/reset-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, challengeId }),
      });
      const data = await res.json();
      if (data.success) {
        fetchLive();
      }
    } catch (err) {
      console.error("Reset error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0e14] text-[#00f0ff] font-mono text-sm">
        [INITIALIZING ORGANIZER COMMAND CONSOLE...]
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0e14] text-[#e2e8f0] pb-16 flex flex-col">
      {/* Top Console Bar */}
      <header className="sticky top-0 z-30 bg-[#0b0e14]/95 backdrop-blur-md border-b border-[#232b3e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RasLogo size={32} />
            <div>
              <h1 className="text-sm font-bold uppercase text-white font-mono tracking-wider">
                ADMIN COMMAND & LIVE TELEMETRY
              </h1>
              <span className="text-[10px] font-mono text-[#00f0ff] uppercase">
                REVERSE ENGINEER THIS • ROUND 3 CONTROLLER
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-2 text-[#10b981]">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              LIVE MONITORING
            </span>
            <button
              onClick={fetchLive}
              className="p-1.5 rounded bg-[#182030] hover:bg-[#232b3e] text-[#94a3b8] hover:text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full space-y-8">
        {/* Teams Status Section */}
        <div className="space-y-4">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#94a3b8] flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#ff7a00]" />
            <span>PARTICIPATING TEAMS ROSTER (5 CONCURRENT TEAMS)</span>
          </h2>

          <div className="overflow-x-auto border border-[#232b3e] rounded-xl bg-[#121722]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0b0e14] text-[#94a3b8] uppercase border-b border-[#232b3e]">
                <tr>
                  <th className="p-3.5">TEAM</th>
                  <th className="p-3.5">STATUS</th>
                  <th className="p-3.5">TOTAL SCORE</th>
                  <th className="p-3.5">ACTIVE ZONES PROGRESS</th>
                  <th className="p-3.5 text-right">ADMIN ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232b3e]">
                {teams.map((t) => {
                  const chs = challenges[t.id] || {};
                  return (
                    <tr key={t.id} className="hover:bg-[#182030]/50 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-white text-sm">
                          T{t.team_number} : {t.team_name}
                        </div>
                        <div className="text-[10px] text-[#64748b]">CODE: {t.access_code}</div>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold ${
                            t.status === "ACTIVE"
                              ? "bg-[#10b981]/15 text-[#10b981] border border-[#10b981]"
                              : t.status === "ELIMINATED"
                              ? "bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]"
                              : "bg-[#64748b]/15 text-[#94a3b8] border border-[#64748b]"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="text-base font-bold text-[#ff7a00]">
                          {t.total_score} PTS
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          {(["z1", "z2", "z3", "z4", "z5"] as const).map((zid) => {
                            const c = chs[zid];
                            const isDone = c?.status === "COMPLETED";
                            const isAct = c?.status === "ACTIVE";
                            const isLocked = c?.status === "LOCKED";
                            return (
                              <span
                                key={zid}
                                title={`${zid.toUpperCase()}: ${c?.status || "PENDING"}`}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  isDone
                                    ? "bg-[#10b981]/20 text-[#10b981] border border-[#10b981]"
                                    : isAct
                                    ? "bg-[#ff7a00]/20 text-[#ff7a00] border border-[#ff7a00] animate-pulse"
                                    : isLocked
                                    ? "bg-[#232b3e] text-[#64748b]"
                                    : "bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/40"
                                }`}
                              >
                                {zid.toUpperCase()}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      <td className="p-3.5 text-right space-x-2">
                        {t.status === "ELIMINATED" && (
                          <button
                            onClick={() => handleGenerateCode(t.id, t.team_name)}
                            className="px-2.5 py-1.5 rounded bg-[#00f0ff] hover:bg-[#7df4ff] text-[#0b0e14] font-bold text-[10px] uppercase transition-colors"
                          >
                            GENERATE CODE
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setAdjustTeamId(t.id);
                            setTargetTeamName(t.team_name);
                          }}
                          className="px-2.5 py-1.5 rounded bg-[#182030] hover:bg-[#232b3e] border border-[#232b3e] text-[10px] text-[#ff7a00] uppercase transition-colors"
                        >
                          ADJUST SCORE
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Violations & Score Audit Feeds */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Violations Log */}
          <div className="p-5 bg-[#121722] border border-[#232b3e] rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-[#ef4444] font-bold">
              <ShieldAlert className="w-4 h-4" />
              <span>COMPETITION VIOLATIONS LOG</span>
            </div>
            {violations.length === 0 ? (
              <p className="text-xs font-mono text-[#64748b]">No violations recorded.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {violations.map((v, i) => (
                  <div
                    key={i}
                    className="p-2.5 bg-[#0b0e14] border border-[#ef4444]/30 rounded text-[11px] font-mono flex items-start justify-between gap-2"
                  >
                    <div>
                      <span className="text-[#ef4444] font-bold">{v.type}</span>
                      <div className="text-[#94a3b8] text-[10px]">
                        Session: {v.session_id}
                      </div>
                    </div>
                    <span className="text-[#64748b] text-[10px]">
                      {new Date(v.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Score Audit Log */}
          <div className="p-5 bg-[#121722] border border-[#232b3e] rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-[#10b981] font-bold">
              <History className="w-4 h-4" />
              <span>SCORE EVENTS AUDIT FEED</span>
            </div>
            {scoreEvents.length === 0 ? (
              <p className="text-xs font-mono text-[#64748b]">No score events logged yet.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {scoreEvents.map((e, i) => (
                  <div
                    key={i}
                    className="p-2.5 bg-[#0b0e14] border border-[#232b3e] rounded text-[11px] font-mono flex items-center justify-between"
                  >
                    <div>
                      <span className="text-white font-medium">{e.reason}</span>
                    </div>
                    <span
                      className={`font-bold ${
                        e.points_delta > 0 ? "text-[#10b981]" : "text-[#ef4444]"
                      }`}
                    >
                      {e.points_delta > 0 ? `+${e.points_delta}` : e.points_delta} PTS
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Continuation Code Modal */}
        {generatedCode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[#121722] border border-[#00f0ff] rounded-xl p-6 space-y-4 text-center">
              <KeyRound className="w-8 h-8 text-[#00f0ff] mx-auto" />
              <h3 className="text-base font-mono uppercase font-bold text-white">
                ONE-TIME CONTINUATION CODE ISSUED
              </h3>
              <p className="text-xs text-[#94a3b8]">
                Provide this code to <strong className="text-white">{targetTeamName}</strong>. They must enter it on <code className="text-[#00f0ff]">/auth</code> to restore their preserved progress.
              </p>
              <div className="p-4 bg-[#0b0e14] border border-[#00f0ff]/40 rounded text-xl font-mono font-bold text-[#00f0ff] tracking-widest select-all">
                {generatedCode}
              </div>
              <button
                onClick={() => setGeneratedCode(null)}
                className="w-full py-2.5 rounded bg-[#182030] hover:bg-[#232b3e] text-xs font-mono text-white uppercase"
              >
                CLOSE
              </button>
            </div>
          </div>
        )}

        {/* Score Adjust Modal */}
        {adjustTeamId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[#121722] border border-[#ff7a00] rounded-xl p-6 space-y-4">
              <h3 className="text-base font-mono uppercase font-bold text-white">
                ADJUST SCORE :: {targetTeamName}
              </h3>
              <div className="space-y-3 text-xs font-mono">
                <div>
                  <label className="text-[#94a3b8] block mb-1">POINTS DELTA (+/-)</label>
                  <input
                    type="number"
                    value={adjustDelta}
                    onChange={(e) => setAdjustDelta(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#0b0e14] border border-[#232b3e] rounded text-white"
                  />
                </div>
                <div>
                  <label className="text-[#94a3b8] block mb-1">AUDIT REASON</label>
                  <input
                    type="text"
                    placeholder="e.g. Organizer manual bonus"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0b0e14] border border-[#232b3e] rounded text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setAdjustTeamId(null)}
                  className="flex-1 py-2 rounded bg-[#182030] text-xs font-mono text-[#94a3b8]"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleScoreAdjust}
                  className="flex-1 py-2 rounded bg-[#ff7a00] text-xs font-mono font-bold text-[#0b0e14]"
                >
                  APPLY ADJUSTMENT
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
