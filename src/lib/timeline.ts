import type { HistoricalEvent } from "@/schemas";

export const PROPHET_BIRTH_YEAR_CE = 570;
export const PROPHETHOOD_START_CE = 610;
export const HIJRA_YEAR_CE = 622;

/**
 * Single numeric axis (fractional CE year) from any historical date so we
 * can order heterogeneous events (pre-prophethood, Meccan, Medinan) on
 * one timeline.
 */
export function toTimelineAxis(event: HistoricalEvent): number {
  const d = event.date;
  if (d.gregorianYear !== undefined) {
    return d.gregorianYear + ((d.gregorianMonth ?? 6) - 1) / 12;
  }
  if (d.yearFromBirth !== undefined) {
    return PROPHET_BIRTH_YEAR_CE + d.yearFromBirth;
  }
  if (d.yearFromProphethood !== undefined) {
    return PROPHETHOOD_START_CE + d.yearFromProphethood;
  }
  if (d.hijri !== undefined) {
    const match = d.hijri.match(/^(BH\s+)?(\d{1,3})/i);
    if (match) {
      const n = Number(match[2]);
      if (match[1]) return HIJRA_YEAR_CE - n;
      return HIJRA_YEAR_CE + n;
    }
  }
  return Number.POSITIVE_INFINITY;
}

export function sortByTimeline(events: HistoricalEvent[]): HistoricalEvent[] {
  return [...events].sort((a, b) => toTimelineAxis(a) - toTimelineAxis(b));
}

/**
 * Computes the natural [min, max] year range to display, with sensible
 * padding so the first/last events aren't pinned to the edge.
 */
export function computeRange(events: HistoricalEvent[]): { min: number; max: number } {
  if (events.length === 0) return { min: PROPHETHOOD_START_CE, max: HIJRA_YEAR_CE + 11 };
  const positions = events.map(toTimelineAxis).filter((n) => Number.isFinite(n));
  const min = Math.min(...positions);
  const max = Math.max(...positions);
  const pad = Math.max(1, (max - min) * 0.08);
  return { min: Math.floor(min - pad), max: Math.ceil(max + pad) };
}

/** Convert CE year to Hijri year (approximate, ±1). */
export function ceToHijri(year: number): number {
  return Math.round((year - HIJRA_YEAR_CE) * (33 / 32));
}

/**
 * Produces year tick marks with a major/minor pattern adapted to the
 * pixels-per-year zoom level so the axis never gets cluttered or sparse.
 */
export function tickEvery(pxPerYear: number): { step: number; majorEvery: number } {
  if (pxPerYear < 3) return { step: 25, majorEvery: 2 };
  if (pxPerYear < 8) return { step: 10, majorEvery: 5 };
  if (pxPerYear < 18) return { step: 5, majorEvery: 2 };
  if (pxPerYear < 35) return { step: 2, majorEvery: 5 };
  if (pxPerYear < 70) return { step: 1, majorEvery: 5 };
  return { step: 1, majorEvery: 1 };
}
