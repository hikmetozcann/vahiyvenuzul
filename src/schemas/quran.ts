import { z } from "zod";
import { LocalizedString } from "./common";
import { Citations } from "./source";

export const RevelationPlace = z.enum(["meccan", "medinan"]);
export type RevelationPlace = z.infer<typeof RevelationPlace>;

export const Surah = z.object({
  number: z.number().int().min(1).max(114),
  name: LocalizedString,
  arabicName: z.string().min(1),
  /** Position in the order of revelation (1 = first revealed). */
  revelationOrder: z.number().int().min(1).max(114),
  place: RevelationPlace,
  ayahCount: z.number().int().min(1),
  /** Notes on partial revelation (some surahs revealed across multiple stages). */
  notes: LocalizedString.optional(),
  sources: Citations,
});
export type Surah = z.infer<typeof Surah>;

/**
 * An Ayah (verse) document. Most ayat won't carry a known cause of revelation;
 * those that do reference an Event via `occasionEventId`.
 */
export const Ayah = z.object({
  surah: z.number().int().min(1).max(114),
  ayah: z.number().int().min(1),
  /** Arabic text — required, the primary scripture. */
  textArabic: z.string().min(1),
  /** Translations (per locale). Translations are not scripture; they're glosses. */
  translation: LocalizedString.optional(),
  /** Stage of revelation if known (early Meccan, Hijra period, etc.). */
  revelationStage: z
    .enum(["early-meccan", "middle-meccan", "late-meccan", "medinan"])
    .optional(),
  /** Event id whose narration explains the cause of revelation. */
  occasionEventId: z.string().regex(/^[a-z0-9-]+$/).optional(),
  /** At minimum the Mushaf itself is the source. */
  sources: Citations,
});
export type Ayah = z.infer<typeof Ayah>;
