"use client";

import React, { useState } from "react";
import { HelpCircle, AlertTriangle, CheckCircle } from "lucide-react";

interface HintModalProps {
  isOpen: boolean;
  cost: number;
  onClose: () => void;
  onConfirm: () => Promise<string | null>;
  revealedHints: string[];
}

export const HintModal: React.FC<HintModalProps> = ({
  isOpen,
  cost,
  onClose,
  onConfirm,
  revealedHints,
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleReveal = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#121722] border border-[#232b3e] rounded-lg shadow-xl overflow-hidden p-6 space-y-5">
        <div className="flex items-center gap-2 text-[#ff7a00]">
          <HelpCircle className="w-5 h-5" />
          <h3 className="font-mono text-base font-bold uppercase tracking-wider text-white">
            REQUEST INTEL HINT
          </h3>
        </div>

        {revealedHints.length > 0 && (
          <div className="space-y-3">
            <span className="text-xs font-mono text-[#94a3b8] uppercase">
              REVEALED INTEL ({revealedHints.length}):
            </span>
            {revealedHints.map((hint, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#0b0e14] border border-[#232b3e] rounded text-xs text-[#00f0ff] font-mono leading-relaxed flex items-start gap-2"
              >
                <CheckCircle className="w-4 h-4 shrink-0 text-[#10b981] mt-0.5" />
                <span>{hint}</span>
              </div>
            ))}
          </div>
        )}

        <div className="p-3.5 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#ef4444]">
            <AlertTriangle className="w-4 h-4" />
            <span>POINT DEDUCTION WARNING</span>
          </div>
          <p className="text-xs text-[#94a3b8]">
            Unlocking an additional hint will immediately deduct{" "}
            <span className="text-[#ef4444] font-bold font-mono">-{cost} POINTS</span> from your
            official competition score.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded bg-[#182030] hover:bg-[#232b3e] text-xs font-mono text-[#94a3b8] hover:text-white uppercase transition-colors"
          >
            CANCEL
          </button>
          <button
            onClick={handleReveal}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded bg-[#ff7a00] hover:bg-[#ff9933] text-xs font-mono font-bold text-[#0b0e14] uppercase transition-colors disabled:opacity-50"
          >
            {loading ? "DECRYPTING..." : `REVEAL (-${cost} PTS)`}
          </button>
        </div>
      </div>
    </div>
  );
};
