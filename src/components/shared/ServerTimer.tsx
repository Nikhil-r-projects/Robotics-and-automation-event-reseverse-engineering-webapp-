"use client";

import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface ServerTimerProps {
  initialSeconds: number;
  onExpire?: () => void;
  isActive: boolean;
}

export const ServerTimer: React.FC<ServerTimerProps> = ({
  initialSeconds,
  onExpire,
  isActive,
}) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (!isActive || seconds <= 0) return;

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, seconds, onExpire]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const formatted = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  const isUrgent = seconds < 60;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded border transition-colors ${
        isUrgent
          ? "bg-[#ef4444]/10 border-[#ef4444] text-[#ef4444] animate-pulse"
          : "bg-[#182030] border-[#232b3e] text-[#ff7a00]"
      }`}
    >
      <Clock className="w-4 h-4" />
      <span className="font-mono text-sm tracking-wider font-semibold">{formatted}</span>
    </div>
  );
};
