"use client";

import { motion } from "framer-motion";
import DustMotes from "./DustMotes";

/**
 * Mekke — altın saat (golden hour) sahnesi. Stylized Kâbe silüeti,
 * çevreleyen tepeler, hurma ağaçları, tozlu sıcak ışık.
 */
export default function SceneMecca({ progress = 0 }: { progress?: number }) {
  const camScale = 1 + progress * 0.08;
  const camX = progress * 24;

  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="mecca-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#5b3a1f" />
          <stop offset="30%" stopColor="#a85a2a" />
          <stop offset="60%" stopColor="#e08f5e" />
          <stop offset="85%" stopColor="#fcd7a4" />
          <stop offset="100%" stopColor="#fde8c4" />
        </linearGradient>
        <radialGradient id="mecca-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff7d8" stopOpacity="1" />
          <stop offset="30%" stopColor="#fde18a" stopOpacity="0.85" />
          <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hills-far" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#7a4828" />
          <stop offset="100%" stopColor="#4f2a14" />
        </linearGradient>
        <linearGradient id="hills-near" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#5a3318" />
          <stop offset="100%" stopColor="#311a08" />
        </linearGradient>
        <linearGradient id="kaaba-fabric" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#1f1f1f" />
          <stop offset="100%" stopColor="#080808" />
        </linearGradient>
        <pattern id="kaaba-band" x="0" y="0" width="120" height="6" patternUnits="userSpaceOnUse">
          <rect width="120" height="6" fill="#d4a017" opacity="0.6" />
        </pattern>
      </defs>

      <rect width="1600" height="900" fill="url(#mecca-sky)" />

      <motion.g
        style={{ transformOrigin: "800px 600px" }}
        animate={{ scale: camScale, x: camX }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Sun */}
        <g transform="translate(1100, 320)">
          <circle r="280" fill="url(#mecca-sun)" />
          <motion.circle
            r="80"
            fill="#fef6c7"
            animate={{ opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </g>

        {/* Far hills */}
        <path
          d="M0 720 L100 620 L240 680 L400 600 L560 660 L720 590 L880 650 L1040 600 L1220 680 L1400 620 L1600 690 L1600 900 L0 900 Z"
          fill="url(#hills-far)"
          opacity="0.9"
        />

        {/* Mid hills */}
        <path
          d="M0 800 L160 720 L320 780 L500 700 L680 770 L860 710 L1040 780 L1200 720 L1400 790 L1600 730 L1600 900 L0 900 Z"
          fill="url(#hills-near)"
        />

        {/* Mecca valley town — clusters of low buildings */}
        <g transform="translate(0, 0)">
          {Array.from({ length: 12 }).map((_, i) => {
            const x = 220 + i * 110 + (i % 2) * 20;
            const w = 60 + (i % 3) * 18;
            const h = 70 + (i % 4) * 22;
            return (
              <g key={i} transform={`translate(${x}, ${800 - h})`}>
                <rect width={w} height={h} fill="#3a2410" />
                <rect width={w} height="4" fill="#1a1004" />
              </g>
            );
          })}
        </g>

        {/* Kaaba — centered, slightly elevated */}
        <g transform="translate(720, 600)">
          {/* Platform */}
          <rect x="-130" y="120" width="260" height="22" fill="#3a2410" />
          <rect x="-130" y="120" width="260" height="4" fill="#1a1004" />
          {/* Cube body */}
          <rect x="-90" y="0" width="180" height="140" fill="url(#kaaba-fabric)" />
          {/* Side perspective */}
          <path d="M90 0 L130 -10 L130 130 L90 140 Z" fill="#000" />
          {/* Golden band (kiswah) */}
          <rect x="-90" y="38" width="180" height="6" fill="url(#kaaba-band)" />
          <path d="M90 38 L130 28 L130 34 L90 44 Z" fill="#d4a017" opacity="0.6" />
          {/* Door hint */}
          <rect x="40" y="60" width="22" height="60" fill="#5a4014" opacity="0.8" />
          <rect x="40" y="60" width="22" height="60" stroke="#d4a017" strokeWidth="0.8" fill="none" />
        </g>

        {/* Palm silhouettes */}
        {[200, 980, 1280].map((x, i) => (
          <g key={i} transform={`translate(${x}, 780)`} opacity="0.85">
            <rect x="-3" y="-90" width="6" height="90" fill="#1a1004" />
            <path d="M0 -90 Q-40 -100 -70 -75 Q-40 -82 0 -82 Z" fill="#2d1e08" />
            <path d="M0 -90 Q40 -100 70 -75 Q40 -82 0 -82 Z" fill="#2d1e08" />
            <path d="M0 -90 Q-30 -125 -60 -120 Q-25 -110 0 -95 Z" fill="#2d1e08" />
            <path d="M0 -90 Q30 -125 60 -120 Q25 -110 0 -95 Z" fill="#2d1e08" />
          </g>
        ))}

        {/* Atmospheric dust */}
        <DustMotes count={28} color="#fff3c2" seed={5} />

        {/* Foreground sand mounds */}
        <path
          d="M0 900 L0 850 L160 870 L340 845 L520 870 L720 840 L920 870 L1120 845 L1320 875 L1500 850 L1600 880 L1600 900 Z"
          fill="#4a2f17"
          opacity="0.95"
        />
      </motion.g>

      {/* Warm overlay + vignette */}
      <rect width="1600" height="900" fill="#d4691a" opacity="0.05" />
      <radialGradient id="mecca-vignette" cx="50%" cy="55%" r="80%">
        <stop offset="55%" stopColor="#000" stopOpacity="0" />
        <stop offset="100%" stopColor="#3a1a05" stopOpacity="0.45" />
      </radialGradient>
      <rect width="1600" height="900" fill="url(#mecca-vignette)" />
    </svg>
  );
}
