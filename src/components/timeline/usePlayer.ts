"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Story-mode player: walks through events sequentially, dwelling on each
 * for a configurable duration. Emits the current index so the parent can
 * pan/zoom the camera to match.
 */
export type PlayerSpeed = 0.5 | 1 | 2;

type Options = {
  count: number;
  /** Base milliseconds per event at 1x speed. */
  dwellMs?: number;
  onStep?: (index: number) => void;
  onFinish?: () => void;
};

export function usePlayer({ count, dwellMs = 4200, onStep, onFinish }: Options) {
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(-1);
  const [speed, setSpeed] = useState<PlayerSpeed>(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cbRef = useRef({ onStep, onFinish });
  useEffect(() => {
    cbRef.current = { onStep, onFinish };
  }, [onStep, onFinish]);

  const clear = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  const stop = useCallback(() => {
    clear();
    setPlaying(false);
    setIndex(-1);
  }, []);

  const pause = useCallback(() => {
    clear();
    setPlaying(false);
  }, []);

  const goTo = useCallback((i: number) => {
    clear();
    setIndex(i);
    cbRef.current.onStep?.(i);
  }, []);

  const next = useCallback(() => {
    setIndex((i) => {
      const nxt = i + 1;
      if (nxt >= count) {
        cbRef.current.onFinish?.();
        setPlaying(false);
        return i;
      }
      cbRef.current.onStep?.(nxt);
      return nxt;
    });
  }, [count]);

  const prev = useCallback(() => {
    setIndex((i) => {
      const prv = Math.max(0, i - 1);
      cbRef.current.onStep?.(prv);
      return prv;
    });
  }, []);

  const play = useCallback(() => {
    if (count === 0) return;
    setPlaying(true);
    if (index < 0) {
      setIndex(0);
      cbRef.current.onStep?.(0);
    }
  }, [count, index]);

  useEffect(() => {
    if (!playing) return;
    if (index < 0 || index >= count) return;
    clear();
    timerRef.current = setTimeout(() => {
      const nxt = index + 1;
      if (nxt >= count) {
        cbRef.current.onFinish?.();
        setPlaying(false);
        return;
      }
      setIndex(nxt);
      cbRef.current.onStep?.(nxt);
    }, dwellMs / speed);
    return clear;
  }, [playing, index, count, dwellMs, speed]);

  useEffect(() => clear, []);

  return { playing, index, speed, setSpeed, play, pause, stop, next, prev, goTo };
}
