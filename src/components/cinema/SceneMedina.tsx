"use client";

import { motion } from "framer-motion";
import DustMotes from "./DustMotes";

/**
 * Medine — vaha şafağı. Yumuşak yeşil-altın tonlar, hurmalıklar, uzaktaki
 * Mescid-i Nebevî kubbesinin işaret edildiği bir silüet.
 */
export default function SceneMedina({ progress = 0 }: { progress?: number }) {
  const camScale = 1 + progress * 0.1;

  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="medina-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#243557" />
          <stop offset="35%" stopColor="#5a6b96" />
          <stop offset="65%" stopColor="#c8a878" />
          <stop offset="100%" stopColor="#f5d99e" />
        </linearGradient>
        <radialGradient id="medina-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff5d0" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#fbcc7a" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#fbcc7a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="medina-hills" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#3d4a5d" />
          <stop offset="100%" stopColor="#1e2738" />
        </linearGradient>
        <linearGradient id="medina-ground" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#2e3a1f" />
          <stop offset="100%" stopColor="#161c0e" />
        </linearGradient>
        <linearGradient id="dome-grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#2a5c3a" />
          <stop offset="55%" stopColor="#3d8a52" />
          <stop offset="100%" stopColor="#1f3f28" />
        </linearGradient>
      </defs>

      <rect width="1600" height="900" fill="url(#medina-sky)" />

      <motion.g
        style={{ transformOrigin: "800px 600px" }}
        animate={{ scale: camScale }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Rising sun */}
        <g transform="translate(900, 480)">
          <circle r="220" fill="url(#medina-sun)" />
          <circle r="55" fill="#fef6c7" opacity="0.95" />
        </g>

        {/* Distant Uhud-like mountain range */}
        <path
          d="M0 700 L120 580 L260 640 L420 520 L580 600 L760 480 L920 580 L1100 500 L1280 620 L1460 540 L1600 640 L1600 900 L0 900 Z"
          fill="url(#medina-hills)"
          opacity="0.85"
        />

        {/* Prophet's mosque silhouette in the distance */}
        <g transform="translate(820, 540)" opacity="0.75">
          {/* Walls */}
          <rect x="-180" y="40" width="360" height="120" fill="#1a2438" />
          {/* Central green dome */}
          <ellipse cx="0" cy="40" rx="40" ry="42" fill="url(#dome-grad)" />
          <path d="M-3 -6 L-3 -34 L3 -34 L3 -6 Z" fill="#d4a017" />
          <circle cx="0" cy="-40" r="4" fill="#d4a017" />
          {/* Minarets */}
          {[-140, -80, 80, 140].map((x, i) => (
            <g key={i} transform={`translate(${x}, 40)`}>
              <rect x="-4" y="-80" width="8" height="80" fill="#1a2438" />
              <path d="M-8 -80 L0 -100 L8 -80 Z" fill="#0d1322" />
              <circle cx="0" cy="-95" r="3" fill="#d4a017" />
            </g>
          ))}
        </g>

        {/* Palm grove — silhouettes scattered across foreground */}
        {[120, 300, 460, 1180, 1340, 1490].map((x, i) => {
          const h = 130 + (i % 3) * 30;
          return (
            <g key={i} transform={`translate(${x}, 760)`}>
              <rect x="-3" y={-h} width="6" height={h} fill="#0e1408" />
              {/* Palm fronds */}
              {[
                "M0 0 Q-50 -10 -80 18 Q-45 4 0 8 Z",
                "M0 0 Q50 -10 80 18 Q45 4 0 8 Z",
                "M0 0 Q-40 -35 -75 -28 Q-30 -22 0 -8 Z",
                "M0 0 Q40 -35 75 -28 Q30 -22 0 -8 Z",
                "M0 0 Q-15 -45 -30 -55 Q-10 -28 0 -10 Z",
                "M0 0 Q15 -45 30 -55 Q10 -28 0 -10 Z",
              ].map((d, j) => (
                <path
                  key={j}
                  d={d}
                  fill="#1f3015"
                  transform={`translate(0, ${-h})`}
                />
              ))}
            </g>
          );
        })}

        {/* Foreground grassy mound */}
        <path
          d="M0 900 L0 820 Q200 790 380 820 Q560 850 740 815 Q920 800 1100 825 Q1280 850 1460 815 L1600 820 L1600 900 Z"
          fill="url(#medina-ground)"
        />

        {/* Bird silhouette */}
        <motion.g
          animate={{ x: [-100, 1700] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          <g transform="translate(0, 220)">
            <motion.path
              d="M0 0 Q-12 -10 -24 0 Q-12 4 0 0 Q12 4 24 0 Q12 -10 0 0 Z"
              fill="#1a2438"
              animate={{ scaleY: [1, 0.4, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
          </g>
        </motion.g>

        <DustMotes count={20} color="#fff5d0" seed={9} />
      </motion.g>

      {/* Soft warm overlay */}
      <radialGradient id="medina-vignette" cx="50%" cy="55%" r="80%">
        <stop offset="60%" stopColor="#000" stopOpacity="0" />
        <stop offset="100%" stopColor="#1a2438" stopOpacity="0.4" />
      </radialGradient>
      <rect width="1600" height="900" fill="url(#medina-vignette)" />
    </svg>
  );
}
