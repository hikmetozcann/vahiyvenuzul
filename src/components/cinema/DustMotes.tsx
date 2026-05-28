"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

/**
 * Slowly drifting dust motes — gives daytime/golden-hour scenes life.
 */
export default function DustMotes({
  count = 24,
  color = "#fff8e0",
  seed = 1,
}: {
  count?: number;
  color?: string;
  seed?: number;
}) {
  const motes = useMemo(() => {
    const rng = mulberry32(seed * 999);
    return Array.from({ length: count }, () => ({
      x: rng() * 100,
      y: 50 + rng() * 50,
      r: 0.8 + rng() * 1.6,
      drift: 4 + rng() * 12,
      duration: 12 + rng() * 18,
      delay: rng() * 8,
      base: 0.18 + rng() * 0.25,
    }));
  }, [count, seed]);

  return (
    <g>
      {motes.map((m, i) => (
        <motion.circle
          key={i}
          cx={`${m.x}%`}
          cy={`${m.y}%`}
          r={m.r}
          fill={color}
          animate={{
            x: [0, m.drift, 0],
            y: [0, -m.drift * 0.6, 0],
            opacity: [m.base, m.base + 0.18, m.base],
          }}
          transition={{
            duration: m.duration,
            repeat: Infinity,
            delay: m.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </g>
  );
}

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
