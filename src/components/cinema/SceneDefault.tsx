"use client";

import { motion } from "framer-motion";
import DustMotes from "./DustMotes";

/**
 * Fallback abstract scene — used when an event has no specific scene
 * mapped yet. Soft cinematic atmosphere; works regardless of context.
 */
export default function SceneDefault({ progress = 0 }: { progress?: number }) {
  const camScale = 1 + progress * 0.06;

  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="def-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#1a1f3a" />
          <stop offset="55%" stopColor="#3a4870" />
          <stop offset="100%" stopColor="#a47a52" />
        </linearGradient>
        <radialGradient id="def-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fde18a" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#fde18a" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1600" height="900" fill="url(#def-sky)" />

      <motion.g
        style={{ transformOrigin: "800px 600px" }}
        animate={{ scale: camScale }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <circle cx="900" cy="400" r="260" fill="url(#def-glow)" />

        {/* Distant hills */}
        <path
          d="M0 700 L200 580 L400 660 L600 540 L820 620 L1040 530 L1280 640 L1500 560 L1600 620 L1600 900 L0 900 Z"
          fill="#2d3450"
          opacity="0.8"
        />
        <path
          d="M0 800 Q200 720 400 780 Q600 840 800 760 Q1000 700 1200 780 Q1400 840 1600 760 L1600 900 L0 900 Z"
          fill="#1a1f3a"
        />

        <DustMotes count={20} color="#fde18a" seed={2} />
      </motion.g>
    </svg>
  );
}
