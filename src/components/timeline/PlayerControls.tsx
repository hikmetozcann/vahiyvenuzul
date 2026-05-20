"use client";

import { motion } from "framer-motion";
import type { PlayerSpeed } from "./usePlayer";

type Props = {
  playing: boolean;
  speed: PlayerSpeed;
  setSpeed: (s: PlayerSpeed) => void;
  onPlay: () => void;
  onPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onStop: () => void;
  index: number;
  total: number;
};

export default function PlayerControls({
  playing,
  speed,
  setSpeed,
  onPlay,
  onPause,
  onPrev,
  onNext,
  onStop,
  index,
  total,
}: Props) {
  const speeds: PlayerSpeed[] = [0.5, 1, 2];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 rounded-full border border-ink/15 bg-parchment/90 backdrop-blur px-2 py-1.5 shadow-sm"
    >
      <IconBtn
        ariaLabel="Önceki"
        onClick={onPrev}
        disabled={index <= 0}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
        </svg>
      </IconBtn>

      <button
        onClick={playing ? onPause : onPlay}
        className="rounded-full bg-accent text-white w-9 h-9 flex items-center justify-center hover:bg-accent-dark transition shadow"
        aria-label={playing ? "Duraklat" : "Oynat"}
      >
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      <IconBtn ariaLabel="Sonraki" onClick={onNext} disabled={index >= total - 1}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 6h2v12h-2zM6 6v12l8.5-6z" />
        </svg>
      </IconBtn>

      <div className="mx-1 h-5 w-px bg-ink/10" />

      <div className="flex items-center gap-1" role="group" aria-label="Hız">
        {speeds.map((s) => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            className={`text-[11px] font-medium rounded-full px-2 py-1 transition ${
              speed === s ? "bg-ink text-parchment" : "text-ink-muted hover:text-ink"
            }`}
            aria-pressed={speed === s}
          >
            {s}×
          </button>
        ))}
      </div>

      {index >= 0 && (
        <>
          <div className="mx-1 h-5 w-px bg-ink/10" />
          <span className="text-xs text-ink-muted tabular-nums px-1">
            {index + 1} / {total}
          </span>
          <button
            onClick={onStop}
            className="text-[11px] text-ink-muted hover:text-ink transition px-2"
            aria-label="Durdur"
          >
            ✕
          </button>
        </>
      )}
    </motion.div>
  );
}

function IconBtn({
  children,
  onClick,
  disabled,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  ariaLabel: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="rounded-full w-8 h-8 flex items-center justify-center text-ink-muted hover:text-ink hover:bg-ink/5 transition disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}
