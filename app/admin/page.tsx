"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { RasLogo } from "@/components/shared/RasLogo";
import {
  ShieldAlert,
  Zap,
  RefreshCw,
  RotateCcw,
  KeyRound,
  History,
  Trophy,
  Download,
  Search,
  Award,
  BarChart3,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
} from "lucide-react";
import { Team, ChallengeId } from "@/types/arena";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [challenges, setChallenges] = useState<Record<string, Record<string, any>>>({});
  const [scoreEvents, setScoreEvents] = useState<any[]>([]);
  const [violations, setViolations] = useState<any[]>([]);
  const [continuationCodes, setContinuationCodes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"rank" | "number">("rank");

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
      console.error("Failed to load admin live telemetry:", err);
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

  // Restart Team
  const [restartingTeamId, setRestartingTeamId] = useState<string | null>(null);

  const handleRestartTeam = async (teamId: string, teamName: string) => {
    const ok = confirm(
      `⚠️ ARE YOU SURE YOU WANT TO RESTART GAME FOR "${teamName.toUpperCase()}"?\n\n` +
      `This will reset their score to 0 PTS, unlock initial zones Z1-Z3, clear active sessions, and reset all challenge progress.`
    );
    if (!ok) return;

    setRestartingTeamId(teamId);
    try {
      const res = await fetch("/api/admin/restart-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchLive();
      } else {
        alert(data.error || "Failed to restart team.");
      }
    } catch (err) {
      console.error("Restart team error:", err);
    } finally {
      setRestartingTeamId(null);
    }
  };

  const handleRestartAllTeams = async () => {
    const ok = confirm(
      `⚠️ MASTER RESET ALL ${teams.length} TEAMS:\n\n` +
      `Are you sure you want to reset ALL registered teams to 0 PTS?\n` +
      `This will restore initial zones Z1-Z3 for every team.`
    );
    if (!ok) return;

    for (const t of teams) {
      try {
        await fetch("/api/admin/restart-team", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teamId: t.id }),
        });
      } catch (err) {
        console.error("Reset all error for team:", t.id, err);
      }
    }
    await fetchLive();
  };

  // Calculated Results & Metrics
  const sortedAndFilteredTeams = useMemo(() => {
    let list = [...teams];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.team_number.toLowerCase().includes(q) ||
          t.team_name.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === "rank") {
      list.sort((a, b) => (b.total_score || 0) - (a.total_score || 0));
    } else {
      list.sort((a, b) => a.team_number.localeCompare(b.team_number, undefined, { numeric: true }));
    }

    return list;
  }, [teams, searchQuery, sortBy]);

  // Ranked order for leaderboard medal indexing
  const rankMap = useMemo(() => {
    const sorted = [...teams].sort((a, b) => (b.total_score || 0) - (a.total_score || 0));
    const map = new Map<string, number>();
    sorted.forEach((t, idx) => map.set(t.id, idx + 1));
    return map;
  }, [teams]);

  // Overall statistics
  const stats = useMemo(() => {
    const totalCount = teams.length;
    const scores = teams.map((t) => t.total_score || 0);
    const topScore = scores.length > 0 ? Math.max(...scores) : 0;
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const topTeam = teams.find((t) => (t.total_score || 0) === topScore && topScore > 0);
    const completedArenas = teams.filter((t) => {
      const chs = challenges[t.id] || {};
      const doneCount = Object.values(chs).filter((c: any) => c?.status === "COMPLETED").length;
      return doneCount === 5 || t.status === "COMPLETED";
    }).length;

    return { totalCount, topScore, topTeam, avgScore, completedArenas };
  }, [teams, challenges]);

  // Export Results as CSV
  const handleExportCSV = () => {
    const headers = [
      "Rank",
      "Team Number",
      "Team Name",
      "Total Score",
      "Status",
      "Z1 Score",
      "Z2 Score",
      "Z3 Score",
      "Z4 Score",
      "Z5 Score",
      "Zones Solved",
      "Access Code",
      "Registered At",
    ];

    const sortedByRank = [...teams].sort((a, b) => (b.total_score || 0) - (a.total_score || 0));

    const rows = sortedByRank.map((t, idx) => {
      const chs = challenges[t.id] || {};
      const z1 = chs.z1?.score_earned || 0;
      const z2 = chs.z2?.score_earned || 0;
      const z3 = chs.z3?.score_earned || 0;
      const z4 = chs.z4?.score_earned || 0;
      const z5 = chs.z5?.score_earned || 0;
      const solved = ["z1", "z2", "z3", "z4", "z5"].filter((z) => chs[z]?.status === "COMPLETED").length;

      return [
        idx + 1,
        `"${t.team_number}"`,
        `"${t.team_name.replace(/"/g, '""')}"`,
        t.total_score || 0,
        t.status,
        z1,
        z2,
        z3,
        z4,
        z5,
        `${solved}/5`,
        `"${t.access_code}"`,
        `"${t.created_at || ""}"`,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ras_arena_results_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0e14] text-[#00f0ff] font-mono text-sm">
        [INITIALIZING ORGANIZER COMMAND & RESULTS CONSOLE...]
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
              <h1 className="text-sm font-bold uppercase text-white font-mono tracking-wider flex items-center gap-2">
                <span>ADMIN COMMAND & LIVE RESULTS</span>
                <span className="px-2 py-0.5 rounded bg-[#00f0ff]/10 text-[#00f0ff] text-[10px] border border-[#00f0ff]/30">
                  OPEN ACCESS ARENA
                </span>
              </h1>
              <span className="text-[10px] font-mono text-[#94a3b8] uppercase">
                REVERSE ENGINEER THIS • OFFICIAL RESULTS PORTAL
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded bg-[#10b981]/15 hover:bg-[#10b981]/30 border border-[#10b981]/40 text-[#10b981] font-bold text-[11px] uppercase transition-colors inline-flex items-center gap-1.5"
              title="Export all results to CSV spreadsheet"
            >
              <Download className="w-3.5 h-3.5" />
              <span>EXPORT CSV</span>
            </button>
            <button
              onClick={handleRestartAllTeams}
              className="px-2.5 py-1.5 rounded bg-[#ef4444]/15 hover:bg-[#ef4444]/30 border border-[#ef4444]/40 text-[#ef4444] font-bold text-[10px] uppercase transition-colors inline-flex items-center gap-1.5"
              title="Reset all teams to 0 points"
            >
              <RotateCcw className="w-3 h-3" />
              RESET ALL TEAMS
            </button>
            <button
              onClick={fetchLive}
              className="p-1.5 rounded bg-[#182030] hover:bg-[#232b3e] text-[#94a3b8] hover:text-white transition-colors"
              title="Refresh telemetry"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-[#121722] border border-[#232b3e] rounded-xl flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-[#94a3b8] uppercase">Total Registered Teams</div>
              <div className="text-2xl font-black font-mono text-white mt-0.5">{stats.totalCount}</div>
            </div>
            <div className="p-3 bg-[#00f0ff]/10 rounded-lg text-[#00f0ff]">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 bg-[#121722] border border-[#232b3e] rounded-xl flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-[#94a3b8] uppercase">Top Score</div>
              <div className="text-2xl font-black font-mono text-[#ff7a00] mt-0.5">
                {stats.topScore} <span className="text-xs font-normal text-[#94a3b8]">PTS</span>
              </div>
              <div className="text-[10px] font-mono text-[#64748b] truncate max-w-[120px]">
                {stats.topTeam ? `T${stats.topTeam.team_number} : ${stats.topTeam.team_name}` : "None yet"}
              </div>
            </div>
            <div className="p-3 bg-[#ff7a00]/10 rounded-lg text-[#ff7a00]">
              <Trophy className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 bg-[#121722] border border-[#232b3e] rounded-xl flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-[#94a3b8] uppercase">Average Score</div>
              <div className="text-2xl font-black font-mono text-[#10b981] mt-0.5">
                {stats.avgScore} <span className="text-xs font-normal text-[#94a3b8]">PTS</span>
              </div>
            </div>
            <div className="p-3 bg-[#10b981]/10 rounded-lg text-[#10b981]">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 bg-[#121722] border border-[#232b3e] rounded-xl flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-[#94a3b8] uppercase">Completed Arenas</div>
              <div className="text-2xl font-black font-mono text-[#00f0ff] mt-0.5">{stats.completedArenas}</div>
            </div>
            <div className="p-3 bg-[#00f0ff]/10 rounded-lg text-[#00f0ff]">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Results Leaderboard Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xs font-mono uppercase tracking-widest text-white flex items-center gap-2 font-bold">
                <Trophy className="w-4 h-4 text-[#ff7a00]" />
                <span>OFFICIAL ARENA RESULTS & LEADERBOARD</span>
              </h2>
              <p className="text-[11px] font-mono text-[#94a3b8] mt-0.5">
                Real-time scores, zone breakdowns, and ranking for all {teams.length} registered teams
              </p>
            </div>

            {/* Controls: Search & Sort */}
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter team..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-[#121722] border border-[#232b3e] focus:border-[#00f0ff] rounded text-xs text-white font-mono placeholder-[#64748b] outline-none w-44"
                />
              </div>

              <div className="flex bg-[#121722] border border-[#232b3e] rounded p-0.5 text-[10px] font-mono">
                <button
                  onClick={() => setSortBy("rank")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    sortBy === "rank" ? "bg-[#ff7a00] text-[#0b0e14] font-bold" : "text-[#94a3b8] hover:text-white"
                  }`}
                >
                  BY RANK
                </button>
                <button
                  onClick={() => setSortBy("number")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    sortBy === "number" ? "bg-[#00f0ff] text-[#0b0e14] font-bold" : "text-[#94a3b8] hover:text-white"
                  }`}
                >
                  BY TEAM #
                </button>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="overflow-x-auto border border-[#232b3e] rounded-xl bg-[#121722]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0b0e14] text-[#94a3b8] uppercase border-b border-[#232b3e]">
                <tr>
                  <th className="p-3.5 w-16 text-center">RANK</th>
                  <th className="p-3.5">TEAM</th>
                  <th className="p-3.5">STATUS</th>
                  <th className="p-3.5">TOTAL SCORE</th>
                  <th className="p-3.5">ZONE RESULTS BREAKDOWN</th>
                  <th className="p-3.5 text-right">ADMIN ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232b3e]">
                {sortedAndFilteredTeams.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#64748b] font-mono text-xs">
                      No matching registered teams found.
                    </td>
                  </tr>
                ) : (
                  sortedAndFilteredTeams.map((t) => {
                    const chs = challenges[t.id] || {};
                    const rank = rankMap.get(t.id) || 1;
                    const solvedCount = ["z1", "z2", "z3", "z4", "z5"].filter(
                      (zid) => chs[zid]?.status === "COMPLETED"
                    ).length;

                    return (
                      <tr key={t.id} className="hover:bg-[#182030]/50 transition-colors">
                        {/* Rank */}
                        <td className="p-3.5 text-center">
                          {rank === 1 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#ff7a00]/20 text-[#ff7a00] border border-[#ff7a00] font-black text-xs shadow-[0_0_10px_rgba(255,122,0,0.4)]">
                              1
                            </span>
                          ) : rank === 2 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#94a3b8]/20 text-[#e2e8f0] border border-[#94a3b8] font-bold text-xs">
                              2
                            </span>
                          ) : rank === 3 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#cd7f32]/20 text-[#cd7f32] border border-[#cd7f32] font-bold text-xs">
                              3
                            </span>
                          ) : (
                            <span className="text-[#64748b] font-bold">#{rank}</span>
                          )}
                        </td>

                        {/* Team Info */}
                        <td className="p-3.5">
                          <div className="font-bold text-white text-sm flex items-center gap-2">
                            <span>T{t.team_number} : {t.team_name}</span>
                          </div>
                          <div className="text-[10px] text-[#64748b] flex items-center gap-2 mt-0.5">
                            <span>CODE: {t.access_code}</span>
                            <span>•</span>
                            <span>{solvedCount}/5 Zones Solved</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                              t.status === "ACTIVE"
                                ? "bg-[#10b981]/15 text-[#10b981] border border-[#10b981]"
                                : t.status === "COMPLETED"
                                ? "bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]"
                                : t.status === "ELIMINATED"
                                ? "bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]"
                                : "bg-[#64748b]/15 text-[#94a3b8] border border-[#64748b]"
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>

                        {/* Total Score */}
                        <td className="p-3.5">
                          <div className="text-base font-extrabold text-[#ff7a00]">
                            {t.total_score || 0}{" "}
                            <span className="text-xs font-normal text-[#94a3b8]">/ 600 PTS</span>
                          </div>
                          <div className="w-28 h-1.5 bg-[#0b0e14] rounded-full overflow-hidden mt-1 border border-[#232b3e]">
                            <div
                              className="h-full bg-[#ff7a00] rounded-full"
                              style={{ width: `${Math.min(100, Math.round(((t.total_score || 0) / 600) * 100))}%` }}
                            />
                          </div>
                        </td>

                        {/* Zone Results Breakdown */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {[
                              { id: "z1", name: "Z1", max: 50 },
                              { id: "z2", name: "Z2", max: 50 },
                              { id: "z3", name: "Z3", max: 100 },
                              { id: "z4", name: "Z4", max: 200 },
                              { id: "z5", name: "Z5", max: 200 },
                            ].map((z) => {
                              const c = chs[z.id];
                              const earned = c?.score_earned || 0;
                              const isDone = c?.status === "COMPLETED";
                              const isAct = c?.status === "ACTIVE";
                              const isLocked = c?.status === "LOCKED";

                              return (
                                <div
                                  key={z.id}
                                  title={`${z.name}: ${earned}/${z.max} PTS (${c?.status || "PENDING"})`}
                                  className={`px-2 py-1 rounded text-[10px] font-mono flex items-center gap-1 border ${
                                    isDone
                                      ? "bg-[#10b981]/20 text-[#10b981] border-[#10b981]"
                                      : isAct
                                      ? "bg-[#ff7a00]/20 text-[#ff7a00] border-[#ff7a00] animate-pulse"
                                      : isLocked
                                      ? "bg-[#0b0e14] text-[#64748b] border-[#232b3e]"
                                      : "bg-[#00f0ff]/10 text-[#00f0ff] border-[#00f0ff]/30"
                                  }`}
                                >
                                  <span className="font-bold">{z.name}:</span>
                                  <span>{earned}p</span>
                                  {isDone && <CheckCircle2 className="w-2.5 h-2.5 text-[#10b981]" />}
                                </div>
                              );
                            })}
                          </div>
                        </td>

                        {/* Admin Actions */}
                        <td className="p-3.5 text-right space-x-1.5">
                          {t.status === "ELIMINATED" && (
                            <button
                              onClick={() => handleGenerateCode(t.id, t.team_name)}
                              className="px-2 py-1 rounded bg-[#00f0ff] hover:bg-[#7df4ff] text-[#0b0e14] font-bold text-[10px] uppercase transition-colors"
                            >
                              CODE
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setAdjustTeamId(t.id);
                              setTargetTeamName(t.team_name);
                            }}
                            className="px-2 py-1 rounded bg-[#182030] hover:bg-[#232b3e] border border-[#232b3e] text-[10px] text-[#ff7a00] uppercase transition-colors"
                          >
                            ADJUST
                          </button>
                          <button
                            onClick={() => handleRestartTeam(t.id, t.team_name)}
                            disabled={restartingTeamId === t.id}
                            className="px-2 py-1 rounded bg-[#ef4444]/15 hover:bg-[#ef4444]/30 border border-[#ef4444]/40 text-[10px] text-[#ef4444] font-bold uppercase transition-colors inline-flex items-center gap-1"
                            title="Reset team score to 0 PTS"
                          >
                            <RotateCcw className={`w-3 h-3 ${restartingTeamId === t.id ? "animate-spin" : ""}`} />
                            RESET
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
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
                      <div className="text-[#94a3b8] text-[10px]">Session: {v.session_id}</div>
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
                Provide this code to <strong className="text-white">{targetTeamName}</strong>. They must enter it on{" "}
                <code className="text-[#00f0ff]">/auth</code> to restore their preserved progress.
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
