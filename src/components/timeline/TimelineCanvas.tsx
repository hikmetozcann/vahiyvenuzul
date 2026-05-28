"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type {
  HistoricalEvent,
  Person,
  Place,
  SourceWork,
} from "@/schemas";
import type { EventType } from "@/schemas";
import { computeRange, toTimelineAxis } from "@/lib/timeline";
import { TYPE_COLORS } from "@/lib/event-style";
import { tr } from "@/lib/i18n-fields";
import type { Locale } from "@/i18n/config";

const TYPE_SHORT_LABEL: Record<EventType, string> = {
  revelation: "Vahiy",
  battle: "Gazve",
  migration: "Hicret",
  treaty: "Antlaşma",
  delegation: "Heyet",
  life: "Hayat",
  miracle: "Mucize",
  birth: "Doğum",
  death: "Vefat",
  marriage: "Nikâh",
  conversion: "İslâm",
  proclamation: "Tebliğ",
  persecution: "Eziyet",
  hajj: "Hac",
  umrah: "Umre",
  diplomatic: "Diplomasi",
};
const typeLabel = (t: EventType) => TYPE_SHORT_LABEL[t] ?? t;
const TYPE_LABEL_COLOR = (t: EventType) => TYPE_COLORS[t] ?? TYPE_COLORS.life;
import { useCamera } from "./useCamera";
import { usePlayer } from "./usePlayer";
import TimeAxis from "./TimeAxis";
import EventNode from "./EventNode";
import DetailSheet from "./DetailSheet";
import PlayerControls from "./PlayerControls";
import FilterChips from "./FilterChips";
import JourneyMode from "@/components/map/JourneyMode";

type Props = {
  events: HistoricalEvent[];
  people: Person[];
  places: Place[];
  sources: SourceWork[];
};

const LANE_HEIGHT = 64;
const TOP_PADDING = 96; // axis + axis labels live in this band
const BOTTOM_PADDING = 40; // room for mini-map

const LANE_ORDER: EventType[] = [
  "revelation",
  "life",
  "migration",
  "battle",
  "treaty",
  "delegation",
  "miracle",
  "birth",
  "death",
  "marriage",
  "conversion",
  "proclamation",
  "persecution",
  "hajj",
  "umrah",
  "diplomatic",
];

export default function TimelineCanvas({ events, people, places, sources }: Props) {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(1000);
  const [hasMeasured, setHasMeasured] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Set<EventType> | "all">("all");
  const [journey, setJourney] = useState<{ active: boolean; startIndex: number }>({ active: false, startIndex: 0 });
  const reducedMotionRef = useRef(false);

  const range = useMemo(() => computeRange(events), [events]);

  const visibleEvents = useMemo(() => {
    return events.filter((e) => filter === "all" || filter.has(e.type));
  }, [events, filter]);

  // Lanes: assign each event to a row based on its type, but only show lanes
  // that actually contain events (denser visualization).
  const lanes = useMemo(() => {
    const used = new Set(visibleEvents.map((e) => e.type));
    const ordered = LANE_ORDER.filter((t) => used.has(t));
    const map = new Map<EventType, number>();
    ordered.forEach((t, i) => map.set(t, i));
    return { ordered, indexFor: (t: EventType) => map.get(t) ?? 0, count: ordered.length };
  }, [visibleEvents]);

  // Resize observer — only width is dynamic; height is derived from lanes.
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setWidth(Math.max(320, rect.width));
      setHasMeasured(true);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const height = Math.max(
    340,
    TOP_PADDING + Math.max(1, lanes.count) * LANE_HEIGHT + BOTTOM_PADDING,
  );
  const size = { width, height };

  // Reduced motion preference
  useEffect(() => {
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const { state: cam, animateTo, setNow } = useCamera(
    { center: (range.min + range.max) / 2, pxPerYear: 30 },
    { min: range.min - 5, max: range.max + 5 },
  );

  // Fit the camera to show all events with a comfortable margin once the
  // real container width is known. Runs again whenever the visible range
  // changes (filter switches that hide events) but only when the user
  // hasn't started panning manually.
  const fittedRef = useRef(false);
  useEffect(() => {
    if (!hasMeasured || fittedRef.current) return;
    const span = Math.max(1, range.max - range.min);
    const targetPx = Math.max(8, Math.min(60, (size.width - 80) / span));
    setNow({
      center: (range.min + range.max) / 2,
      pxPerYear: targetPx,
    });
    fittedRef.current = true;
  }, [hasMeasured, size.width, range.min, range.max, setNow]);

  const pxAt = (year: number) => (year - cam.center) * cam.pxPerYear + size.width / 2;
  const yearAt = (px: number) => (px - size.width / 2) / cam.pxPerYear + cam.center;

  const sortedVisible = useMemo(
    () => [...visibleEvents].sort((a, b) => toTimelineAxis(a) - toTimelineAxis(b)),
    [visibleEvents],
  );

  /**
   * Cluster overlapping nodes within each lane and distribute their y-offset
   * so dots don't visually collide. Pixel-distance threshold scales with
   * the current zoom so clusters reform as the user zooms in/out.
   */
  const nodePositions = useMemo(() => {
    const positions = new Map<string, { x: number; yOffset: number }>();
    const threshold = 22; // px
    for (const type of lanes.ordered) {
      const inLane = sortedVisible.filter((e) => e.type === type);
      let clusterStart = 0;
      let cluster: typeof inLane = [];
      const flush = () => {
        const count = cluster.length;
        cluster.forEach((e, i) => {
          const x = (toTimelineAxis(e) - cam.center) * cam.pxPerYear + size.width / 2;
          const offset = count > 1 ? (i - (count - 1) / 2) * 16 : 0;
          positions.set(e.id, { x, yOffset: offset });
        });
        cluster = [];
      };
      for (const e of inLane) {
        const x = (toTimelineAxis(e) - cam.center) * cam.pxPerYear + size.width / 2;
        if (cluster.length === 0 || Math.abs(x - clusterStart) < threshold) {
          if (cluster.length === 0) clusterStart = x;
          cluster.push(e);
        } else {
          flush();
          cluster.push(e);
          clusterStart = x;
        }
      }
      flush();
    }
    return positions;
  }, [sortedVisible, lanes.ordered, cam.center, cam.pxPerYear, size.width]);

  // Player drives the active event during story mode.
  const player = usePlayer({
    count: sortedVisible.length,
    onStep: (i) => {
      const e = sortedVisible[i];
      if (!e) return;
      setActiveId(e.id);
      const year = toTimelineAxis(e);
      animateTo({ center: year, pxPerYear: Math.max(cam.pxPerYear, 40) });
    },
    onFinish: () => setActiveId(null),
  });

  // Pan via pointer drag. Skip when the press starts on an interactive
  // child (event node) so clicks reach it. We also defer the actual drag
  // until the pointer has moved a few pixels — keeps single-clicks crisp.
  const dragRef = useRef<{ startX: number; startCenter: number; armed: boolean } | null>(null);
  function onPointerDown(e: React.PointerEvent<SVGSVGElement>) {
    if ((e.target as Element).closest('[role="button"]')) return;
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = { startX: e.clientX, startCenter: cam.center, armed: false };
  }
  function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    if (!dragRef.current.armed && Math.abs(dx) < 4) return;
    dragRef.current.armed = true;
    setNow({ center: dragRef.current.startCenter - dx / cam.pxPerYear });
  }
  function onPointerUp() {
    dragRef.current = null;
  }

  // Wheel: zoom around mouse position
  function onWheel(e: React.WheelEvent<SVGSVGElement>) {
    e.preventDefault();
    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseYear = yearAt(mouseX);
    const factor = Math.exp(-e.deltaY * 0.0015);
    const newPx = Math.min(220, Math.max(2, cam.pxPerYear * factor));
    // Anchor zoom around mouse position
    const newCenter = mouseYear - (mouseX - size.width / 2) / newPx;
    setNow({ pxPerYear: newPx, center: newCenter });
  }

  // Pinch zoom (two-finger)
  const pinchRef = useRef<{ startDist: number; startPx: number; centerYear: number } | null>(null);
  const touchesRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  function onTouchStart(e: React.TouchEvent<SVGSVGElement>) {
    for (const t of Array.from(e.touches)) {
      touchesRef.current.set(t.identifier, { x: t.clientX, y: t.clientY });
    }
    if (e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
      const midX = (a.clientX + b.clientX) / 2 - rect.left;
      pinchRef.current = {
        startDist: dist,
        startPx: cam.pxPerYear,
        centerYear: yearAt(midX),
      };
    }
  }
  function onTouchMove(e: React.TouchEvent<SVGSVGElement>) {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault();
      const [a, b] = [e.touches[0], e.touches[1]];
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const newPx = Math.min(
        220,
        Math.max(2, pinchRef.current.startPx * (dist / pinchRef.current.startDist)),
      );
      const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
      const midX = (a.clientX + b.clientX) / 2 - rect.left;
      const newCenter = pinchRef.current.centerYear - (midX - size.width / 2) / newPx;
      setNow({ pxPerYear: newPx, center: newCenter });
    }
  }
  function onTouchEnd(e: React.TouchEvent<SVGSVGElement>) {
    for (const t of Array.from(e.changedTouches)) {
      touchesRef.current.delete(t.identifier);
    }
    if (touchesRef.current.size < 2) pinchRef.current = null;
  }

  // Keyboard nav: arrow keys pan, +/- zoom, space toggles play, esc closes
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case "ArrowLeft":
          setNow({ center: cam.center - 100 / cam.pxPerYear });
          break;
        case "ArrowRight":
          setNow({ center: cam.center + 100 / cam.pxPerYear });
          break;
        case "+":
        case "=":
          setNow({ pxPerYear: cam.pxPerYear * 1.25 });
          break;
        case "-":
        case "_":
          setNow({ pxPerYear: cam.pxPerYear / 1.25 });
          break;
        case " ":
          e.preventDefault();
          player.playing ? player.pause() : player.play();
          break;
        case "Escape":
          if (activeId) setActiveId(null);
          if (player.playing) player.pause();
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cam.center, cam.pxPerYear, player, setNow, activeId]);

  const activeEvent = activeId ? sortedVisible.find((e) => e.id === activeId) ?? null : null;

  // Highlight events related to the hovered one with connection lines
  const hoverEvent = hoverId ? sortedVisible.find((e) => e.id === hoverId) : undefined;
  const connections = useMemo(() => {
    if (!hoverEvent) return [] as { from: HistoricalEvent; to: HistoricalEvent }[];
    return hoverEvent.relations
      .map((rel) => sortedVisible.find((e) => e.id === rel.eventId))
      .filter((e): e is HistoricalEvent => Boolean(e))
      .map((to) => ({ from: hoverEvent, to }));
  }, [hoverEvent, sortedVisible]);

  // Mini-map: render a tiny overview band at the bottom showing all events
  // plus the current viewport window.
  const miniHeight = 28;
  const viewportYearMin = yearAt(0);
  const viewportYearMax = yearAt(size.width);
  const fullRangeWidth = range.max - range.min;
  const miniViewportLeft = ((viewportYearMin - range.min) / fullRangeWidth) * size.width;
  const miniViewportWidth =
    ((viewportYearMax - viewportYearMin) / fullRangeWidth) * size.width;

  return (
    <div className="relative">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <FilterChips active={filter} onChange={setFilter} />
        </div>
        <div className="flex justify-start sm:justify-end items-center gap-3">
          <button
            onClick={() => setJourney({ active: true, startIndex: 0 })}
            className="inline-flex items-center gap-2 rounded-full bg-ink text-parchment px-4 py-2 text-sm font-medium hover:bg-ink-muted transition shadow-sm"
            aria-label={t("journey.open")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 5l6-2 6 2 6-2v16l-6 2-6-2-6 2z" />
              <path d="M9 3v16M15 5v16" />
            </svg>
            {t("journey.open")}
          </button>
          <PlayerControls
            playing={player.playing}
            speed={player.speed}
            setSpeed={player.setSpeed}
            onPlay={player.play}
            onPause={player.pause}
            onPrev={() => {
              player.prev();
            }}
            onNext={() => {
              player.next();
            }}
            onStop={player.stop}
            index={player.index}
            total={sortedVisible.length}
          />
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative w-full select-none rounded-2xl border border-ink/10 bg-gradient-to-b from-parchment to-[#f3efe3] overflow-hidden"
        style={{ touchAction: "pan-y" }}
      >
        <svg
          width={size.width}
          height={size.height}
          viewBox={`0 0 ${size.width} ${size.height}`}
          className="cursor-grab active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerUp}
          onWheel={onWheel}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Subtle vertical grid every major tick */}
          <defs>
            <linearGradient id="lane-bg" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#0f172a05" />
              <stop offset="100%" stopColor="#0f172a00" />
            </linearGradient>
          </defs>

          {/* Lane backgrounds (subtle striping) */}
          {lanes.ordered.map((type, i) => {
            const y = TOP_PADDING + i * LANE_HEIGHT;
            return (
              <rect
                key={type}
                x={0}
                y={y - LANE_HEIGHT / 2 + 6}
                width={size.width}
                height={LANE_HEIGHT - 12}
                fill={i % 2 === 0 ? "#0f172a05" : "transparent"}
                rx={6}
              />
            );
          })}

          {/* Time axis sits in the top band, well above lane rows */}
          <g transform={`translate(0, 40)`}>
            <TimeAxis
              yearAt={yearAt}
              pxAt={pxAt}
              width={size.width}
              pxPerYear={cam.pxPerYear}
            />
          </g>

          {/* Lane type labels on the LEFT edge, vertically centered in lane */}
          {lanes.ordered.map((type, i) => {
            const y = TOP_PADDING + i * LANE_HEIGHT;
            const c = TYPE_LABEL_COLOR(type);
            return (
              <g key={`label-${type}`} transform={`translate(8, ${y})`}>
                <rect
                  x={-2}
                  y={-9}
                  width={typeLabel(type).length * 6 + 12}
                  height={18}
                  rx={9}
                  fill={c.chip}
                  opacity={0.85}
                />
                <text
                  x={4}
                  y={4}
                  fontSize={9}
                  fontWeight={600}
                  fill={c.text}
                  className="uppercase tracking-wider select-none pointer-events-none"
                >
                  {typeLabel(type)}
                </text>
              </g>
            );
          })}

          {/* Anchor lines: prophethood + hijra */}
          {[
            { year: 610, label: "Bi'set" },
            { year: 622, label: "Hicret" },
          ].map(({ year, label }) => {
            const x = pxAt(year);
            if (x < -20 || x > size.width + 20) return null;
            return (
              <g key={year}>
                <line
                  x1={x}
                  x2={x}
                  y1={TOP_PADDING - 8}
                  y2={size.height - 8}
                  stroke="#0d7c66"
                  strokeWidth={1}
                  strokeDasharray="3 4"
                  opacity={0.35}
                />
                <text
                  x={x + 4}
                  y={TOP_PADDING - 12}
                  fontSize={10}
                  className="fill-accent-dark font-medium"
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* Connection lines (when hovering an event) */}
          {connections.map((conn, i) => {
            const fx = pxAt(toTimelineAxis(conn.from));
            const fy = TOP_PADDING + lanes.indexFor(conn.from.type) * LANE_HEIGHT;
            const tx = pxAt(toTimelineAxis(conn.to));
            const ty = TOP_PADDING + lanes.indexFor(conn.to.type) * LANE_HEIGHT;
            const midX = (fx + tx) / 2;
            return (
              <path
                key={i}
                d={`M ${fx} ${fy} C ${midX} ${fy}, ${midX} ${ty}, ${tx} ${ty}`}
                fill="none"
                stroke="#0d7c66"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                opacity={0.55}
              />
            );
          })}

          {/* Event nodes */}
          {sortedVisible.map((event) => {
            const pos = nodePositions.get(event.id);
            if (!pos) return null;
            const x = pos.x;
            const y = TOP_PADDING + lanes.indexFor(event.type) * LANE_HEIGHT + pos.yOffset;
            // Skip off-screen nodes for perf
            if (x < -40 || x > size.width + 200) return null;
            const isActive = event.id === activeId;
            const isHighlighted =
              hoverEvent != null &&
              (event.id === hoverEvent.id ||
                hoverEvent.relations.some((r) => r.eventId === event.id));
            return (
              <g
                key={event.id}
                onMouseEnter={() => setHoverId(event.id)}
                onMouseLeave={() => setHoverId((h) => (h === event.id ? null : h))}
              >
                <EventNode
                  event={event}
                  x={x}
                  y={y}
                  active={isActive}
                  highlighted={isHighlighted}
                  onClick={() => setActiveId(event.id)}
                  label={tr(event.title, locale)}
                  reducedMotion={reducedMotionRef.current}
                />
              </g>
            );
          })}

          {/* Mini-map at bottom */}
          <g transform={`translate(0, ${size.height - miniHeight - 4})`}>
            <rect
              x={0}
              y={0}
              width={size.width}
              height={miniHeight}
              fill="#0f172a08"
              rx={6}
            />
            {sortedVisible.map((e) => {
              const year = toTimelineAxis(e);
              const x = ((year - range.min) / fullRangeWidth) * size.width;
              return (
                <circle
                  key={e.id}
                  cx={x}
                  cy={miniHeight / 2}
                  r={2.5}
                  fill="#0f172a55"
                />
              );
            })}
            <rect
              x={Math.max(0, miniViewportLeft)}
              y={2}
              width={Math.min(size.width, miniViewportWidth)}
              height={miniHeight - 4}
              fill="#0d7c6622"
              stroke="#0d7c66"
              strokeWidth={1}
              rx={4}
            />
          </g>
        </svg>

        {/* Helper hint overlay */}
        {sortedVisible.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-ink-muted text-sm">
            {t("timeline.empty")}
          </div>
        )}
      </div>

      <p className="mt-3 text-xs text-ink-muted text-center">
        {t("timeline.hint")}
      </p>

      <DetailSheet
        event={activeEvent}
        people={new Map(people.map((p) => [p.id, p]))}
        places={new Map(places.map((p) => [p.id, p]))}
        sources={new Map(sources.map((s) => [s.id, s]))}
        onClose={() => setActiveId(null)}
      />

      {journey.active && (
        <JourneyMode
          events={sortedVisible}
          startIndex={journey.startIndex}
          people={people}
          places={places}
          sources={sources}
          onClose={() => setJourney({ active: false, startIndex: 0 })}
        />
      )}
    </div>
  );
}
