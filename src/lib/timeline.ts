import type { HistoricalEvent } from "@/schemas";

/**
 * Produces a single numeric axis from any historical date so we can order
 * heterogeneous events (pre-prophethood, Meccan, Medinan) on one timeline.
 *
 * Strategy: use Gregorian year-month as primary; fall back to the
 * Prophet's birth year (≈ 570 CE) + yearFromBirth; fall back to
 * 610 CE + yearFromProphethood; fall back to 622 CE + hijri year.
 */
const PROPHET_BIRTH_YEAR_CE = 570;
const PROPHETHOOD_START_CE = 610;
const HIJRA_YEAR_CE = 622;

export function toTimelineAxis(event: HistoricalEvent): number {
  const d = event.date;
  if (d.gregorianYear !== undefined) {
    return d.gregorianYear + (d.gregorianMonth ?? 6) / 12;
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
