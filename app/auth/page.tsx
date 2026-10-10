"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { RasLogo } from "@/components/shared/RasLogo";
import { RivoAvatar } from "@/components/shared/RivoAvatar";
import { Shield, KeyRound, RefreshCw, AlertCircle, Terminal } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"credentials" | "continuation">("credentials");
  const [teamNumber, setTeamNumber] = useState("");
  const [teamName, setTeamName] = useState("");
  const [accessCode, setAccessCode] = useState("IEEE");
  const [continuationCode, setContinuationCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "credentials") {
        const res = await fetch("/api/auth/team", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teamNumber, teamName, accessCode }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.error || "Authentication failed.");
          setLoading(false);
          return;
        }
        router.push("/rivo-intro");
      } else {
        const res = await fetch("/api/auth/continue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teamNumber, teamName, continuationCode }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.error || "Continuation code invalid.");
          setLoading(false);
          return;
        }
        router.push("/arena");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0b0e14] technical-grid">
      <div className="w-full max-w-md bg-[#121722] border border-[#232b3e] rounded-xl shadow-[0_0_40px_rgba(255,122,0,0.12)] p-6 sm:p-8 space-y-6 relative overflow-hidden">
        {/* Top corner chamfer accent */}
        <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none overflow-hidden">
          <div className="absolute transform rotate-45 bg-[#ff7a00]/20 w-8 h-8 -top-4 -right-4 border border-[#ff7a00]" />
        </div>

        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="flex justify-center items-center gap-3">
            <RasLogo size={42} />
            <RivoAvatar size={48} mood="idle" />
          </div>

          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#ff7a00] font-semibold">
              IEEE RAS DIGITAL PROVING GROUND
            </span>
            <h1 className="text-2xl font-bold uppercase text-white tracking-wide mt-0.5">
              REVERSE ENGINEER THIS
            </h1>
            <p className="text-xs text-[#00f0ff] font-mono mt-1 font-semibold">
              OPEN ARENA • UNIVERSAL CODE &ldquo;IEEE&rdquo;
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 p-1 bg-[#0b0e14] border border-[#232b3e] rounded-lg">
          <button
            type="button"
            onClick={() => { setMode("credentials"); setError(null); }}
            className={`py-2 text-xs font-mono font-semibold uppercase rounded transition-colors ${
              mode === "credentials"
                ? "bg-[#182030] text-[#ff7a00] border border-[#ff7a00]/30"
                : "text-[#94a3b8] hover:text-white"
            }`}
          >
            TEAM REGISTRATION
          </button>
          <button
            type="button"
            onClick={() => { setMode("continuation"); setError(null); }}
            className={`py-2 text-xs font-mono font-semibold uppercase rounded transition-colors ${
              mode === "continuation"
                ? "bg-[#182030] text-[#00f0ff] border border-[#00f0ff]/30"
                : "text-[#94a3b8] hover:text-white"
            }`}
          >
            CONTINUATION CODE
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-[#ef4444]/10 border border-[#ef4444]/40 rounded-lg flex items-start gap-2.5 text-xs text-[#ef4444] font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono text-[#94a3b8] uppercase mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#ff7a00]" />
                <span>TEAM NUMBER</span>
              </span>
              <span className="text-[10px] text-[#ff7a00] normal-case">(Open for any number)</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 01, 02, 06, 12, 42..."
              value={teamNumber}
              onChange={(e) => setTeamNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0b0e14] border border-[#232b3e] focus:border-[#ff7a00] focus:ring-1 focus:ring-[#ff7a00] rounded text-sm text-white font-mono placeholder-[#64748b] transition-colors outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-[#94a3b8] uppercase mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#00f0ff]" />
                <span>TEAM NAME</span>
              </span>
              <span className="text-[10px] text-[#64748b] normal-case">(Your team name)</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Byte Busters, Cyber Knights, anything..."
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0b0e14] border border-[#232b3e] focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] rounded text-sm text-white font-mono placeholder-[#64748b] transition-colors outline-none"
            />
          </div>

          {mode === "credentials" ? (
            <div>
              <label className="block text-[11px] font-mono text-[#94a3b8] uppercase mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#10b981]" />
                  <span>COMPETITION ACCESS CODE</span>
                </span>
                <span className="text-[10px] text-[#10b981] font-bold normal-case">Code: IEEE</span>
              </label>
              <input
                type="text"
                required
                placeholder="IEEE"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 bg-[#0b0e14] border border-[#10b981]/50 focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] rounded text-sm text-white font-mono placeholder-[#64748b] transition-colors outline-none tracking-widest font-bold"
              />
              <p className="text-[10px] text-[#10b981] font-mono mt-1 flex items-center gap-1">
                ✓ Universal access code is set to &ldquo;IEEE&rdquo; for all teams.
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-mono text-[#00f0ff] uppercase mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>ADMIN CONTINUATION CODE</span>
                </span>
                <span className="text-[10px] text-[#64748b] normal-case">(case-insensitive)</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. RAS-CONT-X7Q2 or ras-cont-x7q2"
                value={continuationCode}
                onChange={(e) => setContinuationCode(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0b0e14] border border-[#00f0ff]/50 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] rounded text-sm text-white font-mono placeholder-[#64748b] transition-colors outline-none tracking-wider"
              />
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded bg-[#ff7a00] hover:bg-[#ff9933] text-[#0b0e14] font-mono text-sm font-bold uppercase tracking-wider transition-all duration-200 shadow-[0_0_15px_rgba(255,122,0,0.3)] disabled:opacity-50"
            >
              {loading
                ? "AUTHENTICATING TELEMETRY..."
                : mode === "credentials"
                ? "ENTER ARENA"
                : "RESTORE COMPETITION STATE"}
            </button>
          </div>
        </form>

        {/* Operational Footer Notice */}
        <div className="pt-2 text-center border-t border-[#232b3e]">
          <p className="text-[10px] font-mono text-[#64748b] leading-relaxed">
            SECURE ACCESS SYSTEM • LIVE COMPETITIVE REVERSE-ENGINEERING ENVIRONMENT
          </p>
        </div>
      </div>
    </div>
  );
}
