"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Spring-driven camera for the map viewport. Mirrors the timeline camera
 * pattern but in 2D: center is (mapX, mapY) in basemap coordinates, plus
 * a scale. The map viewport is `width × height` CSS pixels; the basemap
 * SVG coords are projected through `view = (point - center) * scale + viewport/2`.
 */
export type MapCamera = { cx: number; cy: number; scale: number };

const K = 14;
const D = 14;

export function useMapCamera(initial: MapCamera) {
  const [state, setState] = useState<MapCamera>(initial);
  const stateRef = useRef<MapCamera>(initial);
  const targetRef = useRef<MapCamera>(initial);
  const vRef = useRef({ cx: 0, cy: 0, scale: 0 });
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const reducedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const tick = useCallback((ts: number) => {
    if (lastTsRef.current == null) lastTsRef.current = ts;
    const dt = Math.min(0.05, (ts - lastTsRef.current) / 1000);
    lastTsRef.current = ts;
    const t = targetRef.current;
    const c = stateRef.current;
    const v = vRef.current;

    const acx = K * (t.cx - c.cx) - D * v.cx;
    const acy = K * (t.cy - c.cy) - D * v.cy;
    const ascale = K * (t.scale - c.scale) - D * v.scale;
    v.cx += acx * dt;
    v.cy += acy * dt;
    v.scale += ascale * dt;

    const next: MapCamera = {
      cx: c.cx + v.cx * dt,
      cy: c.cy + v.cy * dt,
      scale: c.scale + v.scale * dt,
    };
    stateRef.current = next;
    setState(next);

    const done =
      Math.abs(t.cx - next.cx) < 0.1 &&
      Math.abs(t.cy - next.cy) < 0.1 &&
      Math.abs(t.scale - next.scale) < 0.0005 &&
      Math.abs(v.cx) < 0.1 &&
      Math.abs(v.cy) < 0.1 &&
      Math.abs(v.scale) < 0.0005;

    if (done) {
      stateRef.current = t;
      vRef.current = { cx: 0, cy: 0, scale: 0 };
      setState(t);
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

  const animateTo = useCallback(
    (next: Partial<MapCamera>) => {
      const merged = { ...targetRef.current, ...next };
      targetRef.current = merged;
      if (reducedRef.current) {
        stateRef.current = merged;
        vRef.current = { cx: 0, cy: 0, scale: 0 };
        setState(merged);
        return;
      }
      startAnim();
    },
    [startAnim],
  );

  const setNow = useCallback(
    (next: Partial<MapCamera>) => {
      stopAnim();
      const merged = { ...stateRef.current, ...next };
      stateRef.current = merged;
      targetRef.current = merged;
      vRef.current = { cx: 0, cy: 0, scale: 0 };
      setState(merged);
    },
    [stopAnim],
  );

  return { state, animateTo, setNow };
}
