"use client";

import { motion } from "framer-motion";
import type { HistoricalEvent } from "@/schemas";
import { TYPE_COLORS } from "@/lib/event-style";

type Props = {
  event: HistoricalEvent;
  x: number;
  y: number;
  active: boolean;
  highlighted: boolean;
  onClick: () => void;
  label: string;
  reducedMotion: boolean;
};

/**
 * A single dot on the timeline. Halo expands on hover/active. Label only
 * appears on the active/highlighted state to avoid clutter in dense areas.
 */
export default function EventNode({
  event,
  x,
  y,
  active,
  highlighted,
  onClick,
  label,
  reducedMotion,
}: Props) {
  const c = TYPE_COLORS[event.type] ?? TYPE_COLORS.life;
  const ringScale = active ? 1.7 : highlighted ? 1.3 : 1;
  const haloOpacity = active ? 0.5 : highlighted ? 0.28 : 0;

  return (
    <motion.g
      transform={`translate(${x}, ${y})`}
      onClick={onClick}
      role="button"
      aria-label={label}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="cursor-pointer focus:outline-none"
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Halo (animated on hover/active) */}
      <motion.circle
        r={22}
        fill={c.fill}
        animate={{ opacity: haloOpacity, scale: active ? 1.4 : 1 }}
        transition={{ duration: reducedMotion ? 0 : 0.25 }}
        style={{ transformOrigin: "center" }}
      />
      {/* Outer disc (always visible) */}
      <motion.circle
        r={11}
        fill={c.ring}
        stroke={c.fill}
        strokeWidth={1.5}
        strokeOpacity={0.4}
        animate={{ scale: ringScale }}
        transition={{ duration: reducedMotion ? 0 : 0.25, ease: "easeOut" }}
        style={{ transformOrigin: "center" }}
      />
      {/* Core dot */}
      <motion.circle
        r={6}
        fill={c.fill}
        stroke="#faf7f0"
        strokeWidth={2}
        animate={{ scale: ringScale }}
        transition={{ duration: reducedMotion ? 0 : 0.25, ease: "easeOut" }}
        style={{ transformOrigin: "center" }}
      />
      {/* Label — only on active/hovered */}
      <motion.g
        animate={{ opacity: active || highlighted ? 1 : 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.2 }}
        className="pointer-events-none"
      >
        <rect
          x={14}
          y={-12}
          width={Math.max(80, label.length * 7) + 14}
          height={24}
          rx={12}
          fill="#0f172a"
          opacity={0.92}
        />
        <text
          x={22}
          y={5}
          className="select-none"
          fontSize={12}
          fill="#faf7f0"
          fontWeight={600}
        >
          {label}
        </text>
      </motion.g>
    </motion.g>
  );
}
