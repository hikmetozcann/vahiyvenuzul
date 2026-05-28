"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { HistoricalEvent, Person, Place, SourceWork } from "@/schemas";
import { tr } from "@/lib/i18n-fields";
import type { Locale } from "@/i18n/config";
import { pickScene } from "./scenePicker";

type Props = {
  events: HistoricalEvent[];
  startIndex?: number;
  people: Person[];
  places: Place[];
  sources: SourceWork[];
  onClose: () => void;
};

const DWELL_MS = 9000;

/**
 * Full-screen cinematic narration. Each event is rendered with a stylized
 * scene (per location), atmospheric particles, slow camera moves, and a
 * typewriter-style narrative overlay. Auto-advances through events with
 * smooth crossfade transitions.
 */
export default function CinemaMode({
  events,
  startIndex = 0,
  people,
  places,
  onClose,
}: Props) {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const [index, setIndex] = useState(startIndex);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<0.5 | 1 | 2>(1);
  const [progress, setProgress] = useState(0);
  const reducedMotion = useRef(false);
  const rafRef = useRef<number | null>(null);
  const startedAt = useRef<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Reset progress whenever scene changes
  useEffect(() => {
    setProgress(0);
    startedAt.current = performance.now();
  }, [index]);

  // Drive progress (0..1) over DWELL_MS / speed
  useEffect(() => {
    if (!playing) return;
    const tick = (now: number) => {
      const elapsed = now - startedAt.current;
      const total = DWELL_MS / speed;
      const p = Math.min(1, elapsed / total);
      setProgress(p);
      if (p >= 1) {
        if (index >= events.length - 1) {
          setPlaying(false);
          return;
        }
        setIndex((i) => Math.min(events.length - 1, i + 1));
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, index, speed, events.length]);

  // Keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case " ":
          e.preventDefault();
          setPlaying((p) => !p);
          break;
        case "ArrowRight":
          setIndex((i) => Math.min(events.length - 1, i + 1));
          break;
        case "ArrowLeft":
          setIndex((i) => Math.max(0, i - 1));
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, events.length]);

  const event = events[index];
  if (!event) return null;

  const Scene = pickScene(event);
  const place = event.placeId ? places.find((p) => p.id === event.placeId) : undefined;
  const relatedPeople = event.peopleIds
    .map((pid) => people.find((p) => p.id === pid))
    .filter((p): p is Person => Boolean(p));

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      role="dialog"
      aria-label="Sinema modu"
    >
      {/* Scene crossfade */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={event.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.45, 0, 0.2, 1] }}
        >
          <Scene progress={progress} />
        </motion.div>
      </AnimatePresence>

      {/* Overlay text */}
      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-12 z-10 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
            className="max-w-3xl mx-auto text-parchment"
          >
            <div className="flex items-center gap-3 text-xs uppercase tracking-widest opacity-80 mb-2">
              <span className="inline-block w-8 h-px bg-parchment/60" />
              <span>
                {[
                  event.date.hijri && `${event.date.hijri} H`,
                  event.date.gregorianYear && `${event.date.gregorianYear} M`,
                ]
                  .filter(Boolean)
                  .join(" / ")}
              </span>
              {place && <span className="opacity-60">· {tr(place.name, locale)}</span>}
            </div>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight leading-tight drop-shadow-lg">
              {tr(event.title, locale)}
            </h2>
            <p className="mt-4 text-base sm:text-lg max-w-2xl leading-relaxed opacity-90 drop-shadow-md">
              {tr(event.summary, locale)}
            </p>
            {relatedPeople.length > 0 && (
              <p className="mt-3 text-sm opacity-70">
                {relatedPeople.map((p) => tr(p.name, locale)).join(" · ")}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Top bar — close + progress + index */}
      <div className="absolute inset-x-0 top-0 z-20 p-4 sm:p-6 flex items-center gap-3 text-parchment/90">
        <span className="text-xs uppercase tracking-widest opacity-80">Sinema</span>
        <span className="text-xs tabular-nums opacity-80">
          {index + 1} / {events.length}
        </span>
        <div className="flex-1 h-[2px] bg-parchment/15 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-parchment/70"
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-2 hover:bg-parchment/10 transition"
          aria-label="Kapat"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Bottom controls — play/pause/prev/next/speed */}
      <div className="absolute inset-x-0 bottom-0 z-20 pb-3 sm:pb-6 flex justify-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="pointer-events-auto rounded-full bg-black/40 backdrop-blur border border-parchment/15 px-2 py-1.5 flex items-center gap-1 text-parchment/90"
        >
          <IconBtn
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index <= 0}
            ariaLabel="Önceki"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </IconBtn>
          <button
            onClick={() => setPlaying((p) => !p)}
            className="rounded-full bg-parchment text-ink w-10 h-10 flex items-center justify-center hover:bg-white transition mx-1"
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
          <IconBtn
            onClick={() => setIndex((i) => Math.min(events.length - 1, i + 1))}
            disabled={index >= events.length - 1}
            ariaLabel="Sonraki"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 6h2v12h-2zM6 6v12l8.5-6z" />
            </svg>
          </IconBtn>
          <div className="mx-1 h-5 w-px bg-parchment/20" />
          {([0.5, 1, 2] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`text-[11px] font-medium rounded-full px-2 py-1 transition ${
                speed === s ? "bg-parchment text-ink" : "text-parchment/70 hover:text-parchment"
              }`}
            >
              {s}×
            </button>
          ))}
        </motion.div>
      </div>

      {/* Hint */}
      <div className="absolute top-1/2 left-4 -translate-y-1/2 z-10 pointer-events-none text-parchment/40 text-[11px] hidden sm:block">
        ESC kapat · Space oynat/dur · ← → geç
      </div>
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
      className="rounded-full w-8 h-8 flex items-center justify-center hover:bg-parchment/10 transition disabled:opacity-30"
    >
      {children}
    </button>
  );
}
