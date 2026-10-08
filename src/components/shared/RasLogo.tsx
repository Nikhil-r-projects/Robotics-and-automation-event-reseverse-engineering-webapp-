import React from "react";

export const RasLogo: React.FC<{ size?: number; className?: string }> = ({
  size = 36,
  className = "",
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`inline-flex items-center justify-center ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full filter drop-shadow-[0_0_8px_rgba(255,122,0,0.3)]"
      >
        <polygon
          points="50,6 94,28 94,72 50,94 6,72 6,28"
          stroke="#ff7a00"
          strokeWidth="6"
          fill="#121722"
        />
        <polygon
          points="50,18 82,34 82,66 50,82 18,66 18,34"
          stroke="#232b3e"
          strokeWidth="3"
          fill="#0b0e14"
        />
        {/* Core Technical Symbol */}
        <path
          d="M36 40 L50 28 L64 40 L50 72 Z"
          fill="none"
          stroke="#00f0ff"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <circle cx="50" cy="46" r="5" fill="#ff7a00" />
      </svg>
    </div>
  );
};
