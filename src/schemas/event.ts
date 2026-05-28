import { z } from "zod";
import { LocalizedString, LocalizedRichText } from "./common";
import { HistoricalDate } from "./date";
import { Citations } from "./source";

/**
 * Event types — kept intentionally broad and extensible. Adding a new type
 * means: add the literal here, add a filter label in messages/*.json, and
 * (optionally) add an icon/color in the timeline component.
 */
export const EventType = z.enum([
  "revelation",
  "battle",
  "migration",
  "treaty",
  "delegation",
  "life",
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
]);
export type EventType = z.infer<typeof EventType>;

/** How another event relates to this one. */
export const EventRelationKind = z.enum([
  "caused-by",
  "led-to",
  "concurrent-with",
  "preceded-by",
  "followed-by",
  "see-also",
]);

export const EventRelation = z.object({
  kind: EventRelationKind,
  eventId: z.string().regex(/^[a-z0-9-]+$/),
});

/**
 * Journey metadata for events that involve travel between places —
 * primarily migrations, expeditions, delegations, and diplomatic visits.
 * The map view uses this to draw the route on the basemap.
 */
export const Journey = z.object({
  fromPlaceId: z.string().regex(/^[a-z0-9-]+$/),
  via: z.array(z.string().regex(/^[a-z0-9-]+$/)).default([]),
  /** Whether the path bends gently — purely visual hint for the renderer. */
  curve: z.enum(["straight", "curve"]).default("curve"),
});
export type Journey = z.infer<typeof Journey>;

export const HistoricalEvent = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  type: EventType,
  title: LocalizedString,
  summary: LocalizedString,
  description: LocalizedRichText.optional(),
  date: HistoricalDate,
  /** Destination / location for the event. */
  placeId: z.string().regex(/^[a-z0-9-]+$/).optional(),
  /** Optional journey trace — origin and intermediate stops. */
  journey: Journey.optional(),
  /** Person id references — anyone meaningfully involved. */
  peopleIds: z.array(z.string().regex(/^[a-z0-9-]+$/)).default([]),
  /**
   * Verses connected to this event. Format: "surah:ayah" or "surah:ayah-ayah".
   * For revelation events this is the verse(s) revealed; for other events
   * these are verses commenting on or referring to the event.
   */
  ayahReferences: z.array(z.string().regex(/^\d{1,3}:\d{1,3}(-\d{1,3})?$/)).default([]),
  /** Cause-of-revelation narrative when applicable. */
  occasionOfRevelation: LocalizedRichText.optional(),
  /** Free-form relations to other events. */
  relations: z.array(EventRelation).default([]),
  /** Every event must cite at least one source. */
  sources: Citations,
  /** Whether scholars disagree significantly about this report. */
  contested: z.boolean().default(false),
  /** Editorial notes (not displayed by default). */
  editorialNote: z.string().optional(),
});
export type HistoricalEvent = z.infer<typeof HistoricalEvent>;
