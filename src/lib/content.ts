import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { z, ZodError, ZodType } from "zod";
import {
  Ayah,
  HistoricalEvent,
  Person,
  Place,
  SourceWork,
  Surah,
} from "@/schemas";

const CONTENT_ROOT = path.join(process.cwd(), "content");

type ContentKind = "events" | "people" | "places" | "sources" | "surahs" | "ayahs";

const SCHEMA_BY_KIND: Record<ContentKind, ZodType> = {
  events: HistoricalEvent,
  people: Person,
  places: Place,
  sources: SourceWork,
  surahs: Surah,
  ayahs: Ayah,
};

export class ContentValidationError extends Error {
  constructor(public readonly file: string, public readonly zodError: ZodError) {
    super(`Content validation failed for ${file}:\n${zodError.message}`);
  }
}

function listYamlFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return listYamlFiles(full);
      if (entry.isFile() && (entry.name.endsWith(".yaml") || entry.name.endsWith(".yml"))) {
        return [full];
      }
      return [];
    });
}

function loadKind<T>(kind: ContentKind): T[] {
  const schema = SCHEMA_BY_KIND[kind] as ZodType<T>;
  const dir = path.join(CONTENT_ROOT, kind);
  const files = listYamlFiles(dir);
  return files.map((file) => {
    const raw = fs.readFileSync(file, "utf8");
    const data = parseYaml(raw);
    const result = schema.safeParse(data);
    if (!result.success) {
      throw new ContentValidationError(file, result.error);
    }
    return result.data;
  });
}

/**
 * Loads and validates the entire corpus. Performs referential integrity
 * checks across entities (e.g. every personId on an event must resolve).
 */
export function loadCorpus() {
  const sources = loadKind<z.infer<typeof SourceWork>>("sources");
  const people = loadKind<z.infer<typeof Person>>("people");
  const places = loadKind<z.infer<typeof Place>>("places");
  const surahs = loadKind<z.infer<typeof Surah>>("surahs");
  const ayahs = loadKind<z.infer<typeof Ayah>>("ayahs");
  const events = loadKind<z.infer<typeof HistoricalEvent>>("events");

  const sourceIds = new Set(sources.map((s) => s.id));
  const personIds = new Set(people.map((p) => p.id));
  const placeIds = new Set(places.map((p) => p.id));
  const eventIds = new Set(events.map((e) => e.id));
  const surahNumbers = new Set(surahs.map((s) => s.number));

  const errors: string[] = [];

  for (const event of events) {
    for (const c of event.sources) {
      if (!sourceIds.has(c.sourceId)) {
        errors.push(`event ${event.id}: unknown sourceId "${c.sourceId}"`);
      }
    }
    if (event.placeId && !placeIds.has(event.placeId)) {
      errors.push(`event ${event.id}: unknown placeId "${event.placeId}"`);
    }
    for (const pid of event.peopleIds) {
      if (!personIds.has(pid)) {
        errors.push(`event ${event.id}: unknown personId "${pid}"`);
      }
    }
    for (const rel of event.relations) {
      if (!eventIds.has(rel.eventId)) {
        errors.push(`event ${event.id}: relation to unknown event "${rel.eventId}"`);
      }
    }
    for (const ref of event.ayahReferences) {
      const surahNum = Number(ref.split(":")[0]);
      if (!surahNumbers.has(surahNum)) {
        errors.push(`event ${event.id}: ayah reference to unloaded surah ${surahNum} (${ref})`);
      }
    }
    if (event.journey) {
      if (!placeIds.has(event.journey.fromPlaceId)) {
        errors.push(`event ${event.id}: journey.fromPlaceId "${event.journey.fromPlaceId}" not found`);
      }
      for (const v of event.journey.via) {
        if (!placeIds.has(v)) {
          errors.push(`event ${event.id}: journey.via "${v}" not found`);
        }
      }
    }
  }

  for (const person of people) {
    for (const c of person.sources) {
      if (!sourceIds.has(c.sourceId)) {
        errors.push(`person ${person.id}: unknown sourceId "${c.sourceId}"`);
      }
    }
  }

  for (const ayah of ayahs) {
    if (!surahNumbers.has(ayah.surah)) {
      errors.push(`ayah ${ayah.surah}:${ayah.ayah}: unloaded surah`);
    }
    if (ayah.occasionEventId && !eventIds.has(ayah.occasionEventId)) {
      errors.push(`ayah ${ayah.surah}:${ayah.ayah}: unknown occasionEventId "${ayah.occasionEventId}"`);
    }
    for (const c of ayah.sources) {
      if (!sourceIds.has(c.sourceId)) {
        errors.push(`ayah ${ayah.surah}:${ayah.ayah}: unknown sourceId "${c.sourceId}"`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Referential integrity errors:\n - ${errors.join("\n - ")}`);
  }

  return { sources, people, places, surahs, ayahs, events };
}

export type Corpus = ReturnType<typeof loadCorpus>;
