"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { RasLogo } from "@/components/shared/RasLogo";
import { ShieldCheck, Lock, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Admin authentication failed.");
        setLoading(false);
        return;
      }
      router.push("/admin");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0b0e14] technical-grid">
      <div className="w-full max-w-md bg-[#121722] border border-[#232b3e] rounded-xl shadow-[0_0_40px_rgba(0,240,255,0.1)] p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <RasLogo size={42} />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#00f0ff] font-semibold">
              ORGANIZER COMMAND CENTER
            </span>
            <h1 className="text-xl font-bold uppercase text-white tracking-wide mt-0.5">
              ADMINISTRATIVE ACCESS
            </h1>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-[#ef4444]/15 border border-[#ef4444] rounded text-xs text-[#ef4444] font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono text-[#94a3b8] uppercase mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00f0ff]" />
              <span>ADMINISTRATOR USERNAME</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0b0e14] border border-[#232b3e] focus:border-[#00f0ff] rounded text-sm text-white font-mono outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-[#94a3b8] uppercase mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#ff7a00]" />
              <span>MASTER CREDENTIAL</span>
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0b0e14] border border-[#232b3e] focus:border-[#ff7a00] rounded text-sm text-white font-mono outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded bg-[#00f0ff] hover:bg-[#7df4ff] text-[#0b0e14] font-mono text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(0,240,255,0.25)]"
            >
              {loading ? "AUTHENTICATING..." : "ACCESS COMMAND CONSOLE"}
            </button>
          </div>
        </form>

        <div className="text-center pt-2 text-[10px] font-mono text-[#64748b]">
          DEFAULT CREDENTIALS: admin / admin@ras2026
        </div>
      </div>
    </div>
  );
}
