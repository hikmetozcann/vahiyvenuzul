"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

/**
 * Procedural starfield. Stars are deterministic (seeded) so layout is
 * stable across renders, but each star twinkles on its own gentle cycle.
 */
export default function Stars({
  count = 80,
  brightness = 1,
  seed = 1,
}: {
  count?: number;
  brightness?: number;
  seed?: number;
}) {
  const stars = useMemo(() => {
    const rng = mulberry32(seed * 1000);
    return Array.from({ length: count }, () => ({
      x: rng() * 100,
      y: rng() * 60,
      r: 0.4 + rng() * 1.3,
      delay: rng() * 4,
      duration: 2 + rng() * 4,
      base: 0.35 + rng() * 0.5,
    }));
  }, [count, seed]);

  return (
    <g>
      {stars.map((s, i) => (
        <motion.circle
          key={i}
          cx={`${s.x}%`}
          cy={`${s.y}%`}
          r={s.r}
          fill="#fdfaf0"
          animate={{
            opacity: [
              s.base * brightness,
              (s.base + 0.4) * brightness,
              s.base * brightness,
            ],
          }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            delay: s.delay,
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
