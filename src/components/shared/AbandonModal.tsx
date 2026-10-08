"use client";

import React, { useState } from "react";
import { AlertOctagon } from "lucide-react";

interface AbandonModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export const AbandonModal: React.FC<AbandonModalProps> = ({
  isOpen,
  onCancel,
  onConfirm,
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAbandon = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#121722] border border-[#ef4444]/40 rounded-lg shadow-2xl p-6 space-y-5">
        <div className="flex items-center gap-2.5 text-[#ef4444]">
          <AlertOctagon className="w-6 h-6" />
          <h3 className="font-mono text-base font-bold uppercase tracking-wider text-white">
            ABANDON CHALLENGE
          </h3>
        </div>

        <div className="p-4 bg-[#0b0e14] border border-[#232b3e] rounded space-y-2 text-xs text-[#94a3b8] leading-relaxed">
          <p className="font-semibold text-white">Are you sure?</p>
          <p>
            Your earned points from completed stages will be <span className="text-[#10b981] font-semibold">retained</span>.
          </p>
          <p>
            The remaining challenge time will be <span className="text-[#ef4444] font-semibold">forfeited</span> and you will receive no further points for this zone.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded bg-[#182030] hover:bg-[#232b3e] text-xs font-mono font-bold text-white uppercase transition-colors"
          >
            CONTINUE PLAYING
          </button>
          <button
            onClick={handleAbandon}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded bg-[#ef4444] hover:bg-[#dc2626] text-xs font-mono font-bold text-white uppercase transition-colors disabled:opacity-50"
          >
            {loading ? "FORFEITING..." : "ABANDON"}
          </button>
        </div>
      </div>
    </div>
  );
};
