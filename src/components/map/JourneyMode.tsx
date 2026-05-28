"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { HistoricalEvent, Person, Place, SourceWork } from "@/schemas";
import type { Locale } from "@/i18n/config";
import { tr } from "@/lib/i18n-fields";
import { MAP_HEIGHT, MAP_WIDTH, project } from "./projection";
import BaseMap from "./BaseMap";
import MapMarker from "./MapMarker";
import RouteLine from "./RouteLine";
import { useMapCamera } from "./useMapCamera";

type Props = {
  events: HistoricalEvent[];
  startIndex?: number;
  people: Person[];
  places: Place[];
  sources: SourceWork[];
  onClose: () => void;
};

const DWELL_MS = 7500;

/**
 * Full-screen, map-driven historical narrative.
 *
 * For each event the camera animates to the event's place; if the event
 * has `journey` metadata the route is drawn between origin and destination
 * while the camera frames both. A narrative card on the right shows the
 * event's title, date, summary, related people, and cited sources.
 *
 * All visuals are derived from data: places appear because they have
 * `coordinates`; routes appear because events declare `journey`. Adding
 * a new YAML file picks up automatically.
 */
export default function JourneyMode({
  events,
  startIndex = 0,
  people,
  places,
  sources,
  onClose,
}: Props) {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const [index, setIndex] = useState(startIndex);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<0.5 | 1 | 2>(1);
  const [progress, setProgress] = useState(0);
  const startedAt = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  const placeMap = useMemo(() => new Map(places.map((p) => [p.id, p])), [places]);
  const peopleMap = useMemo(() => new Map(people.map((p) => [p.id, p])), [people]);
  const sourceMap = useMemo(() => new Map(sources.map((s) => [s.id, s])), [sources]);

  // Initial camera shows the whole peninsula
  const { state: cam, animateTo, setNow } = useMapCamera({
    cx: MAP_WIDTH / 2,
    cy: MAP_HEIGHT / 2,
    scale: 0.55,
  });

  // Viewport size
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 1000, h: 700 });
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setSize({ w: Math.max(320, r.width), h: Math.max(360, r.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // When the active event changes, frame its location (or the journey if any)
  useEffect(() => {
    const ev = events[index];
    if (!ev) return;
    const dest = ev.placeId ? placeMap.get(ev.placeId) : undefined;
    const origin = ev.journey?.fromPlaceId ? placeMap.get(ev.journey.fromPlaceId) : undefined;

    if (origin?.coordinates && dest?.coordinates) {
      // Journey — frame both endpoints
      const a = project(origin.coordinates.lat, origin.coordinates.lng);
      const b = project(dest.coordinates.lat, dest.coordinates.lng);
      const cx = (a.x + b.x) / 2;
      const cy = (a.y + b.y) / 2;
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const scale = Math.min(1.6, Math.max(0.45, (size.w * 0.55) / Math.max(1, dist + 220)));
      animateTo({ cx, cy, scale });
    } else if (dest?.coordinates) {
      const { x, y } = project(dest.coordinates.lat, dest.coordinates.lng);
      animateTo({ cx: x, cy: y, scale: 1.4 });
    } else {
      animateTo({ cx: MAP_WIDTH / 2, cy: MAP_HEIGHT / 2, scale: 0.55 });
    }
  }, [index, events, placeMap, animateTo, size.w]);

  // Reset and run scene progress (0..1) over dwell time
  useEffect(() => {
    setProgress(0);
    startedAt.current = performance.now();
  }, [index]);

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
        setIndex((i) => i + 1);
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

  const destPlace = event.placeId ? placeMap.get(event.placeId) : undefined;
  const originPlace = event.journey?.fromPlaceId
    ? placeMap.get(event.journey.fromPlaceId)
    : undefined;
  const relatedPeople = event.peopleIds
    .map((pid) => peopleMap.get(pid))
    .filter((p): p is Person => Boolean(p));

  // Marker states: every other place is "highlighted" so labels read, active
  // place(s) pulse. Origin and destination on journey events both highlight.
  function markerState(placeId: string): "idle" | "highlighted" | "active" {
    if (placeId === destPlace?.id) return "active";
    if (placeId === originPlace?.id) return "active";
    return "highlighted";
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-parchment overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      role="dialog"
      aria-label={t("journey.label")}
    >
      <div className="flex flex-col h-full">
        {/* Top bar */}
        <div className="px-4 sm:px-6 py-3 flex items-center gap-3 border-b border-ink/10">
          <span className="text-xs uppercase tracking-widest text-ink-muted">
            {t("journey.label")}
          </span>
          <span className="text-xs text-ink-muted tabular-nums">
            {index + 1} / {events.length}
          </span>
          <div className="flex-1 h-[2px] bg-ink/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent"
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-ink/5 transition text-ink-muted"
            aria-label={t("journey.close")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main split: map + narrative */}
        <div className="flex-1 grid grid-rows-[1fr_auto] lg:grid-rows-1 lg:grid-cols-[1fr_440px] min-h-0">
          {/* Map viewport */}
          <div
            ref={containerRef}
            className="relative bg-[#cbd6dc] overflow-hidden"
          >
            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${size.w} ${size.h}`}
              preserveAspectRatio="xMidYMid slice"
            >
              {/* Apply camera transform: scale around viewport center, then
                  translate so that cam (cx,cy) maps to viewport center. */}
              <g
                transform={`translate(${size.w / 2} ${size.h / 2}) scale(${cam.scale}) translate(${-cam.cx} ${-cam.cy})`}
              >
                <BaseMap />

                {/* All places as faint markers; active/origin get highlight */}
                {places
                  .filter((p) => p.coordinates)
                  .map((place) => (
                    <MapMarker
                      key={place.id}
                      place={place}
                      locale={locale}
                      state={markerState(place.id)}
                    />
                  ))}

                {/* Route line for journey events */}
                {event.journey && destPlace && (
                  <RouteLine
                    journey={event.journey}
                    destinationPlaceId={destPlace.id}
                    places={placeMap}
                    progress={progress}
                  />
                )}
              </g>
            </svg>

            {/* Faint compass rose in the corner — purely decorative */}
            <div className="absolute bottom-3 right-3 text-ink-muted opacity-40 pointer-events-none">
              <svg width="48" height="48" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="1" />
                <path d="M24 6 L26 24 L24 22 L22 24 Z" fill="currentColor" />
                <path d="M24 42 L22 24 L24 26 L26 24 Z" fill="currentColor" opacity="0.5" />
                <text x="24" y="14" fontSize="8" textAnchor="middle" fill="currentColor">K</text>
                <text x="24" y="40" fontSize="8" textAnchor="middle" fill="currentColor" opacity="0.5">G</text>
              </svg>
            </div>
          </div>

          {/* Narrative panel */}
          <div className="bg-parchment border-t lg:border-t-0 lg:border-s border-ink/10 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="p-5 sm:p-6 space-y-4"
              >
                <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-ink-muted">
                  <span className="inline-block w-6 h-px bg-ink-muted/40" />
                  <span>{event.type}</span>
                  <span>·</span>
                  <span>
                    {[
                      event.date.hijri && `${event.date.hijri} H`,
                      event.date.gregorianYear && `${event.date.gregorianYear} M`,
                    ]
                      .filter(Boolean)
                      .join(" / ")}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-tight">
                  {tr(event.title, locale)}
                </h2>

                {destPlace && (
                  <p className="text-sm text-ink-muted">
                    {originPlace
                      ? `${tr(originPlace.name, locale)} → ${tr(destPlace.name, locale)}`
                      : tr(destPlace.name, locale)}
                  </p>
                )}

                <p className="text-[15px] leading-relaxed">
                  {tr(event.summary, locale)}
                </p>

                {event.description && (
                  <p className="text-[15px] leading-relaxed text-ink-muted whitespace-pre-line">
                    {tr(event.description, locale)}
                  </p>
                )}

                {relatedPeople.length > 0 && (
                  <div className="text-sm">
                    <div className="text-xs uppercase tracking-widest text-ink-muted mb-1">
                      {t("event.people")}
                    </div>
                    <div>{relatedPeople.map((p) => tr(p.name, locale)).join(" · ")}</div>
                  </div>
                )}

                <div>
                  <div className="text-xs uppercase tracking-widest text-ink-muted mb-2">
                    {t("event.sources")}
                  </div>
                  <ul className="space-y-1.5 text-sm">
                    {event.sources.map((c, i) => {
                      const work = sourceMap.get(c.sourceId);
                      const ref = [
                        c.volume && `c. ${c.volume}`,
                        c.page && `s. ${c.page}`,
                        c.hadithNumber && `h. ${c.hadithNumber}`,
                        c.ayahReference,
                      ]
                        .filter(Boolean)
                        .join(", ");
                      return (
                        <li key={i} className="flex items-baseline gap-2">
                          <span className="rounded bg-ink/5 px-1.5 py-0.5 text-[10px] uppercase tracking-wide whitespace-nowrap">
                            {t(`event.grade_${c.grade}` as never)}
                          </span>
                          <span>
                            <span className="font-medium">
                              {work ? tr(work.title, locale) : c.sourceId}
                            </span>
                            {ref && <span className="text-ink-muted"> — {ref}</span>}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="border-t border-ink/10 px-4 py-3 flex items-center justify-center gap-2">
          <button
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index <= 0}
            className="rounded-full w-9 h-9 flex items-center justify-center text-ink-muted hover:text-ink hover:bg-ink/5 transition disabled:opacity-30"
            aria-label={t("journey.prev")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>
          <button
            onClick={() => setPlaying((p) => !p)}
            className="rounded-full bg-accent text-white w-11 h-11 flex items-center justify-center hover:bg-accent-dark transition shadow"
            aria-label={playing ? t("journey.pause") : t("journey.play")}
          >
            {playing ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => setIndex((i) => Math.min(events.length - 1, i + 1))}
            disabled={index >= events.length - 1}
            className="rounded-full w-9 h-9 flex items-center justify-center text-ink-muted hover:text-ink hover:bg-ink/5 transition disabled:opacity-30"
            aria-label={t("journey.next")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 6h2v12h-2zM6 6v12l8.5-6z" />
            </svg>
          </button>
          <div className="mx-2 h-5 w-px bg-ink/15" />
          {([0.5, 1, 2] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`text-[11px] font-medium rounded-full px-2.5 py-1.5 transition ${
                speed === s ? "bg-ink text-parchment" : "text-ink-muted hover:text-ink"
              }`}
              aria-pressed={speed === s}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
