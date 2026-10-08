"use client";

import React from "react";
import Link from "next/link";
import { AlertOctagon, ArrowLeft, ShieldAlert } from "lucide-react";
import { RivoAvatar } from "@/components/shared/RivoAvatar";

export default function EliminatedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0b0e14] technical-grid">
      <div className="w-full max-w-lg bg-[#121722] border-2 border-[#ef4444] rounded-xl shadow-[0_0_50px_rgba(239,68,68,0.25)] p-6 sm:p-8 space-y-6 text-center">
        {/* Rivo in alert mood */}
        <div className="flex justify-center">
          <RivoAvatar size={84} mood="alert" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#ef4444]/15 border border-[#ef4444] text-xs font-mono text-[#ef4444] font-bold">
            <AlertOctagon className="w-4 h-4" />
            <span>COMPETITION VIOLATION DETECTED</span>
          </div>
          
          <h1 className="text-3xl font-extrabold uppercase text-white tracking-wide">
            STATUS: ELIMINATED
          </h1>

          <p className="text-sm font-mono text-[#ef4444]">
            You left the active competition environment.
          </p>
        </div>

        {/* Informational Box */}
        <div className="p-4 bg-[#0b0e14] border border-[#232b3e] rounded-lg text-xs text-[#94a3b8] space-y-2.5 leading-relaxed text-left">
          <div className="flex items-center gap-2 text-white font-mono font-semibold">
            <ShieldAlert className="w-4 h-4 text-[#ff7a00]" />
            <span>PROGRESS INTEGRITY PRESERVED</span>
          </div>
          <p>
            Your completed challenge scores, recovered fragments, and verified stage milestones remain safely preserved in the server ledger.
          </p>
          <p>
            To restore access, contact the competition organizers. If granted a continuation code, you may redeem it on the primary authentication screen.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link
            href="/auth"
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded bg-[#182030] hover:bg-[#232b3e] border border-[#232b3e] hover:border-[#ff7a00] text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO AUTHENTICATION</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
