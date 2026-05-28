"use client";

import { motion } from "framer-motion";
import Stars from "./Stars";

/**
 * Hira Mağarası — yıldızlı gece sahnesi.
 *
 * Katmanlar (uzaktan yakına):
 *   sky gradient → stars → distant moon → mountain silhouette → cave
 *   opening with warm glow → foreground rocks
 *
 * Kamera: ağır ağır mağaraya doğru zoom + hafif sola pan.
 */
export default function SceneCaveHira({ progress = 0 }: { progress?: number }) {
  // progress 0..1 — used to advance subtle camera moves over scene lifetime
  const camScale = 1 + progress * 0.12;
  const camX = -progress * 30;

  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="hira-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#080a25" />
          <stop offset="45%" stopColor="#141742" />
          <stop offset="85%" stopColor="#27265a" />
          <stop offset="100%" stopColor="#3a2f5c" />
        </linearGradient>
        <radialGradient id="moon-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff3c2" stopOpacity="0.55" />
          <stop offset="50%" stopColor="#fff3c2" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#fff3c2" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cave-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fcb754" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#f59e0b" stopOpacity="0.55" />
          <stop offset="80%" stopColor="#b45309" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="mountain-far" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#1c1c44" />
          <stop offset="100%" stopColor="#0a0a22" />
        </linearGradient>
        <linearGradient id="mountain-near" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#0e0e2a" />
          <stop offset="100%" stopColor="#04040f" />
        </linearGradient>
        <filter id="soft-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>

      {/* Sky */}
      <rect width="1600" height="900" fill="url(#hira-sky)" />

      <motion.g
        style={{ transformOrigin: "800px 600px" }}
        animate={{ scale: camScale, x: camX }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Stars in two layers for depth */}
        <Stars count={120} brightness={0.9} seed={3} />
        <g transform="translate(0, -40)">
          <Stars count={40} brightness={1.2} seed={11} />
        </g>

        {/* Moon */}
        <g transform="translate(1250, 180)">
          <circle r="120" fill="url(#moon-glow)" />
          <circle r="46" fill="#fef6c7" />
          <circle r="46" fill="#1a1c47" cx="-22" cy="-6" />
        </g>

        {/* Distant mountain range */}
        <path
          d="M0 720 L120 580 L260 660 L420 540 L580 620 L720 530 L880 620 L1040 540 L1220 640 L1400 560 L1600 660 L1600 900 L0 900 Z"
          fill="url(#mountain-far)"
          opacity="0.85"
        />

        {/* Mid mountain — the prophet's mountain (Jabal an-Nur) */}
        <path
          d="M180 900 L420 540 L520 460 L600 420 L680 460 L780 540 L860 620 L940 700 L1100 760 L1280 820 L1280 900 Z"
          fill="url(#mountain-near)"
        />

        {/* Cave opening glow */}
        <g transform="translate(600, 470)">
          <circle r="180" fill="url(#cave-glow)" filter="url(#soft-glow)" />
          <motion.circle
            r="120"
            fill="url(#cave-glow)"
            animate={{ opacity: [0.6, 0.95, 0.6] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Cave mouth shape */}
          <path
            d="M-44 28 Q-50 -28 0 -38 Q50 -28 44 28 Q22 50 0 50 Q-22 50 -44 28 Z"
            fill="#1a0f04"
          />
          <path
            d="M-38 22 Q-44 -22 0 -30 Q44 -22 38 22 Q18 42 0 42 Q-18 42 -38 22 Z"
            fill="#3a1f08"
            opacity="0.85"
          />
        </g>

        {/* Foreground silhouette rocks */}
        <path
          d="M0 900 L0 820 L120 800 L260 840 L380 810 L500 850 L640 820 L820 860 L1000 830 L1180 870 L1340 840 L1500 870 L1600 830 L1600 900 Z"
          fill="#000"
          opacity="0.85"
        />
      </motion.g>

      {/* Vignette */}
      <radialGradient id="hira-vignette" cx="50%" cy="50%" r="75%">
        <stop offset="60%" stopColor="#000" stopOpacity="0" />
        <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
      </radialGradient>
      <rect width="1600" height="900" fill="url(#hira-vignette)" />
    </svg>
  );
}
