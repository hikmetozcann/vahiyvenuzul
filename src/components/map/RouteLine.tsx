"use client";

import { motion } from "framer-motion";
import type { Journey, Place } from "@/schemas";
import { project, curvedPath } from "./projection";

type Props = {
  journey: Journey;
  destinationPlaceId: string | undefined;
  places: Map<string, Place>;
  /** 0..1 — how far along the route to draw. */
  progress: number;
};

/**
 * Renders a dashed, animated route line for journey events.
 * Walks: fromPlaceId → via[0..n] → destinationPlaceId. Each segment
 * is a gentle curve so consecutive points don't look like a ruler.
 */
export default function RouteLine({
  journey,
  destinationPlaceId,
  places,
  progress,
}: Props) {
  if (!destinationPlaceId) return null;

  const seq = [journey.fromPlaceId, ...journey.via, destinationPlaceId];
  const points: { x: number; y: number; id: string }[] = [];
  for (const id of seq) {
    const p = places.get(id);
    if (!p?.coordinates) continue;
    const { x, y } = project(p.coordinates.lat, p.coordinates.lng);
    points.push({ x, y, id });
  }
  if (points.length < 2) return null;

  return (
    <g>
      {points.slice(0, -1).map((from, i) => {
        const to = points[i + 1];
        const d =
          journey.curve === "straight"
            ? `M ${from.x} ${from.y} L ${to.x} ${to.y}`
            : curvedPath(from, to, 0.16);
        return (
          <g key={`${from.id}-${to.id}`}>
            {/* Soft glow underneath */}
            <motion.path
              d={d}
              fill="none"
              stroke="#0d7c66"
              strokeWidth={6}
              strokeLinecap="round"
              opacity={0.18}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: Math.min(1, Math.max(0, progress * points.length - i)) }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
            {/* Main dashed line */}
            <motion.path
              d={d}
              fill="none"
              stroke="#0d7c66"
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray="6 6"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: Math.min(1, Math.max(0, progress * points.length - i)) }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </g>
        );
      })}
    </g>
  );
}
