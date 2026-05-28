"use client";

import { motion } from "framer-motion";
import DustMotes from "./DustMotes";

/**
 * Hicret — Mekke'den Medine'ye yolculuk. Çöl yolu sahnesi: kum tepeleri,
 * uzaktaki sıradağlar, gece-gündüz arası alacakaranlık, animasyonlu rota
 * çizgisi, deve siluetinin yavaş ilerleyişi.
 */
export default function SceneJourney({ progress = 0 }: { progress?: number }) {
  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="journey-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#2a1d52" />
          <stop offset="35%" stopColor="#6b3460" />
          <stop offset="65%" stopColor="#d8723f" />
          <stop offset="100%" stopColor="#f5b878" />
        </linearGradient>
        <linearGradient id="dune-far" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#6b4423" />
          <stop offset="100%" stopColor="#3a2410" />
        </linearGradient>
        <linearGradient id="dune-mid" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#8a5a2c" />
          <stop offset="100%" stopColor="#4a2e12" />
        </linearGradient>
        <linearGradient id="dune-near" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#a87340" />
          <stop offset="100%" stopColor="#5a3a18" />
        </linearGradient>
        <radialGradient id="journey-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef6c7" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#fbcc7a" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#fbcc7a" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1600" height="900" fill="url(#journey-sky)" />

      {/* Sun setting on horizon */}
      <g transform="translate(1180, 540)">
        <circle r="260" fill="url(#journey-sun)" />
        <circle r="70" fill="#fef6c7" opacity="0.95" />
      </g>

      {/* Distant mountain range */}
      <path
        d="M0 600 L140 480 L280 540 L440 440 L600 510 L760 430 L920 500 L1100 420 L1280 510 L1460 460 L1600 530 L1600 700 L0 700 Z"
        fill="url(#dune-far)"
        opacity="0.85"
      />

      {/* Middle dunes */}
      <path
        d="M0 700 Q200 620 400 680 Q600 740 800 660 Q1000 600 1200 680 Q1400 740 1600 660 L1600 900 L0 900 Z"
        fill="url(#dune-mid)"
      />

      {/* Foreground dunes */}
      <path
        d="M0 900 L0 830 Q200 770 400 820 Q600 870 800 800 Q1000 760 1200 820 Q1400 870 1600 800 L1600 900 Z"
        fill="url(#dune-near)"
      />

      {/* Curving route line — animated draw */}
      <motion.path
        d="M120 880 Q300 800 480 820 Q660 840 820 770 Q980 700 1180 720 Q1340 740 1480 660"
        fill="none"
        stroke="#fff8d8"
        strokeWidth="3"
        strokeDasharray="8 8"
        strokeOpacity="0.7"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: Math.min(1, progress * 1.4) }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />

      {/* Way-point markers */}
      <g>
        <circle cx="120" cy="880" r="6" fill="#fff" />
        <text x="120" y="905" fill="#fff" fontSize="14" textAnchor="middle" opacity="0.85">
          Mekke
        </text>
      </g>
      <g>
        <motion.circle
          cx="1480"
          cy="660"
          r="8"
          fill="#fcd34d"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <text x="1480" y="690" fill="#fff" fontSize="14" textAnchor="middle" opacity="0.9">
          Medine
        </text>
      </g>

      {/* Camel + rider silhouette, traveling along route */}
      <motion.g
        animate={{
          x: progress * 1280,
          y: -Math.sin(progress * 3) * 30,
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <g transform="translate(140, 850)">
          {/* Camel */}
          <path
            d="M0 0 L4 -6 L12 -8 L24 -22 L34 -20 L36 -8 L48 -8 L52 -18 L56 -16 L60 -8 L68 -8 L70 0 L60 0 L60 -4 L52 -4 L52 0 L20 0 L20 -4 L12 -4 L12 0 Z"
            fill="#1a0e04"
            transform="scale(1.4)"
          />
          {/* Rider */}
          <circle cx="36" cy="-32" r="6" fill="#1a0e04" transform="scale(1.4)" />
          <rect x="32" y="-28" width="8" height="12" fill="#1a0e04" transform="scale(1.4)" />
        </g>
      </motion.g>

      {/* Atmospheric haze */}
      <DustMotes count={32} color="#fef3c7" seed={7} />

      {/* Vignette */}
      <radialGradient id="journey-vignette" cx="50%" cy="55%" r="80%">
        <stop offset="60%" stopColor="#000" stopOpacity="0" />
        <stop offset="100%" stopColor="#2a1052" stopOpacity="0.5" />
      </radialGradient>
      <rect width="1600" height="900" fill="url(#journey-vignette)" />
    </svg>
  );
}
