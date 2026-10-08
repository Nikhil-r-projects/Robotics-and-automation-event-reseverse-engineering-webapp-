import React from "react";

interface RivoAvatarProps {
  size?: number;
  mood?: "idle" | "speaking" | "curious" | "alert" | "success";
  className?: string;
}

export const RivoAvatar: React.FC<RivoAvatarProps> = ({
  size = 64,
  mood = "idle",
  className = "",
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center select-none ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full filter drop-shadow-[0_0_12px_rgba(255,122,0,0.35)]"
      >
        {/* Antenna */}
        <line x1="50" y1="8" x2="50" y2="22" stroke="#ff7a00" strokeWidth="4" strokeLinecap="round" />
        <circle
          cx="50"
          cy="7"
          r="4"
          fill={mood === "alert" ? "#ef4444" : mood === "success" ? "#10b981" : "#ff7a00"}
          className="animate-pulse"
        />

        {/* Outer Ears */}
        <rect x="14" y="38" width="6" height="24" rx="3" fill="#232b3e" stroke="#ff7a00" strokeWidth="2" />
        <rect x="80" y="38" width="6" height="24" rx="3" fill="#232b3e" stroke="#ff7a00" strokeWidth="2" />

        {/* Head Chassis */}
        <rect
          x="20"
          y="22"
          width="60"
          height="56"
          rx="12"
          fill="#121722"
          stroke="#ff7a00"
          strokeWidth="3"
        />

        {/* Corner Rivets */}
        <circle cx="26" cy="28" r="1.5" fill="#a78b7c" />
        <circle cx="74" cy="28" r="1.5" fill="#a78b7c" />
        <circle cx="26" cy="72" r="1.5" fill="#a78b7c" />
        <circle cx="74" cy="72" r="1.5" fill="#a78b7c" />

        {/* Visor Area */}
        <rect
          x="28"
          y="34"
          width="44"
          height="24"
          rx="6"
          fill="#0b0e14"
          stroke="#232b3e"
          strokeWidth="2"
        />

        {/* Visor Digital Eyes */}
        {mood === "idle" && (
          <g fill="#00f0ff">
            <rect x="34" y="42" width="10" height="8" rx="2" className="animate-pulse" />
            <rect x="56" y="42" width="10" height="8" rx="2" className="animate-pulse" />
          </g>
        )}
        {mood === "speaking" && (
          <g fill="#00f0ff">
            <rect x="34" y="40" width="10" height="12" rx="2" />
            <rect x="56" y="40" width="10" height="12" rx="2" />
          </g>
        )}
        {mood === "curious" && (
          <g fill="#00f0ff">
            <circle cx="39" cy="46" r="5" />
            <rect x="56" y="44" width="10" height="5" rx="1.5" />
          </g>
        )}
        {mood === "alert" && (
          <g fill="#ef4444">
            <polygon points="34,48 44,42 44,48" />
            <polygon points="66,48 56,42 56,48" />
          </g>
        )}
        {mood === "success" && (
          <g stroke="#10b981" strokeWidth="3" strokeLinecap="round">
            <path d="M34 46 L39 42 L44 46" fill="none" />
            <path d="M56 46 L61 42 L66 46" fill="none" />
          </g>
        )}

        {/* Mouth Audio Waveform Line */}
        <g stroke={mood === "alert" ? "#ef4444" : "#ff7a00"} strokeWidth="2" strokeLinecap="round">
          <line x1="38" y1="67" x2="44" y2="67" />
          <line x1="47" y1="65" x2="53" y2="65" />
          <line x1="56" y1="67" x2="62" y2="67" />
        </g>
      </svg>
    </div>
  );
};
