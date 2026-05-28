"use client";

import { motion } from "framer-motion";
import type { Place } from "@/schemas";
import type { Locale } from "@/i18n/config";
import { tr } from "@/lib/i18n-fields";
import { project } from "./projection";

type Props = {
  place: Place;
  locale: Locale;
  /** Visual state — drives size, color, label visibility. */
  state: "idle" | "highlighted" | "active";
  onClick?: () => void;
};

/**
 * Place marker on the basemap. Three states:
 *   idle         — small dot, no label
 *   highlighted  — slightly larger dot with persistent label
 *   active       — pulsing halo, prominent label card
 */
export default function MapMarker({ place, locale, state, onClick }: Props) {
  if (!place.coordinates) return null;
  const { x, y } = project(place.coordinates.lat, place.coordinates.lng);
  const name = tr(place.name, locale);

  const visible = state !== "idle";
  const isActive = state === "active";

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? name : undefined}
      className={onClick ? "cursor-pointer" : ""}
    >
      {/* Pulsing halo for active state */}
      {isActive && (
        <motion.circle
          r={28}
          fill="#0d7c66"
          initial={{ opacity: 0.5, scale: 0.6 }}
          animate={{ opacity: [0.5, 0.1, 0.5], scale: [0.6, 1.4, 0.6] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Inner halo */}
      <motion.circle
        r={isActive ? 13 : 8}
        fill={isActive ? "#0d7c66" : "#0f172a"}
        opacity={0.18}
        animate={{ r: isActive ? 13 : 8 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Core marker */}
      <motion.circle
        r={isActive ? 5.5 : 3.5}
        fill={isActive ? "#0d7c66" : "#3a2a14"}
        stroke="#faf7f0"
        strokeWidth={1.5}
        animate={{ r: isActive ? 5.5 : 3.5 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Label */}
      {visible && (
        <motion.g
          initial={{ opacity: 0, y: -2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <text
            x={10}
            y={4}
            fontSize={isActive ? 13 : 11}
            fontWeight={isActive ? 600 : 500}
            fill={isActive ? "#0d7c66" : "#3a2a14"}
            className="select-none pointer-events-none"
            style={{
              paintOrder: "stroke",
              stroke: "#faf7f0",
              strokeWidth: 3,
              strokeLinejoin: "round",
            }}
          >
            {name}
          </text>
        </motion.g>
      )}
    </g>
  );
}
