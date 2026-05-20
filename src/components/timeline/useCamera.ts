"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Camera state for the horizontal timeline:
 * - `center` is the CE year currently in the middle of the viewport
 * - `pxPerYear` is the zoom level (pixels per Gregorian year)
 * - `width` is the current viewport width in pixels (for px↔year conversion)
 *
 * Animation uses a critically-damped spring (rAF loop) for buttery pan/zoom
 * without overshoot. Falls back to instant when prefers-reduced-motion is on.
 */
export type CameraState = { center: number; pxPerYear: number };

const STIFFNESS = 12;
const DAMPING = 12;

export function useCamera(initial: CameraState, bounds: { min: number; max: number }) {
  const [state, setState] = useState<CameraState>(initial);
  const targetRef = useRef<CameraState>(initial);
  const stateRef = useRef<CameraState>(initial);
  const velocityRef = useRef({ center: 0, pxPerYear: 0 });
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const tick = useCallback((ts: number) => {
    if (lastTsRef.current == null) lastTsRef.current = ts;
    const dt = Math.min(0.05, (ts - lastTsRef.current) / 1000);
    lastTsRef.current = ts;

    const target = targetRef.current;
    const cur = stateRef.current;
    const v = velocityRef.current;

    const ax = STIFFNESS * (target.center - cur.center) - DAMPING * v.center;
    const az = STIFFNESS * (target.pxPerYear - cur.pxPerYear) - DAMPING * v.pxPerYear;
    v.center += ax * dt;
    v.pxPerYear += az * dt;

    const next: CameraState = {
      center: cur.center + v.center * dt,
      pxPerYear: cur.pxPerYear + v.pxPerYear * dt,
    };
    stateRef.current = next;
    setState(next);

    const done =
      Math.abs(target.center - next.center) < 0.001 &&
      Math.abs(target.pxPerYear - next.pxPerYear) < 0.05 &&
      Math.abs(v.center) < 0.001 &&
      Math.abs(v.pxPerYear) < 0.05;

    if (done) {
      stateRef.current = target;
      setState(target);
      velocityRef.current = { center: 0, pxPerYear: 0 };
      rafRef.current = null;
      lastTsRef.current = null;
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const startAnim = useCallback(() => {
    if (rafRef.current != null) return;
    lastTsRef.current = null;
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const stopAnim = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    lastTsRef.current = null;
  }, []);

  useEffect(() => stopAnim, [stopAnim]);

  const clamp = useCallback(
    (s: CameraState): CameraState => ({
      center: Math.min(bounds.max, Math.max(bounds.min, s.center)),
      pxPerYear: Math.min(220, Math.max(2, s.pxPerYear)),
    }),
    [bounds.max, bounds.min],
  );

  const animateTo = useCallback(
    (next: Partial<CameraState>) => {
      const merged = clamp({ ...targetRef.current, ...next });
      targetRef.current = merged;
      if (reducedMotionRef.current) {
        stateRef.current = merged;
        velocityRef.current = { center: 0, pxPerYear: 0 };
        setState(merged);
        return;
      }
      startAnim();
    },
    [clamp, startAnim],
  );

  /** Apply changes instantly (drag pan, wheel zoom — already smooth on input). */
  const setNow = useCallback(
    (next: Partial<CameraState>) => {
      stopAnim();
      const merged = clamp({ ...stateRef.current, ...next });
      stateRef.current = merged;
      targetRef.current = merged;
      velocityRef.current = { center: 0, pxPerYear: 0 };
      setState(merged);
    },
    [clamp, stopAnim],
  );

  return { state, animateTo, setNow };
}
