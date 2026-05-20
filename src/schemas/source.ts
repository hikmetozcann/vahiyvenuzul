import { z } from "zod";
import { LocalizedString } from "./common";

/**
 * Authenticity grades. "quran" is its own tier because Qur'anic text is not
 * subject to hadith authentication. Other grades follow classical muhaddith
 * terminology.
 */
export const AuthenticityGrade = z.enum([
  "quran",
  "mutawatir",
  "sahih",
  "hasan",
  "daif",
  "mawdu",
]);
export type AuthenticityGrade = z.infer<typeof AuthenticityGrade>;

/**
 * Categories of primary sources we accept. Each Source document declares
 * which category it belongs to so the UI can filter and color-code.
 */
export const SourceCategory = z.enum([
  "quran",
  "hadith",
  "sira",
  "tabaqat",
  "tafsir",
  "asbab-nuzul",
  "tarikh",
]);
export type SourceCategory = z.infer<typeof SourceCategory>;

/**
 * A Source document — a *work* (e.g. Sahih al-Bukhari), not an individual
 * citation. Citations reference a Source by id and add volume/page/hadith no.
 */
export const SourceWork = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, "Source id must be kebab-case ASCII"),
  category: SourceCategory,
  title: LocalizedString,
  author: LocalizedString,
  authorDeathHijri: z.number().int().positive().optional(),
  description: LocalizedString.optional(),
  language: z.enum(["ar", "fa", "tr", "en"]).default("ar"),
});
export type SourceWork = z.infer<typeof SourceWork>;

/**
 * A Citation is the per-fact reference: which source, where in it, and how
 * authentic the cited report is. Every fact in the corpus MUST carry at
 * least one Citation — enforced at the schema level on each entity.
 */
export const Citation = z.object({
  sourceId: z.string().regex(/^[a-z0-9-]+$/),
  /** Volume (cilt) when applicable */
  volume: z.union([z.number().int().positive(), z.string()]).optional(),
  /** Page or folio reference */
  page: z.union([z.number().int().positive(), z.string()]).optional(),
  /** Hadith number for hadith collections */
  hadithNumber: z.union([z.number().int().positive(), z.string()]).optional(),
  /** Surah:Ayah reference for Quranic citations, e.g. "96:1-5" */
  ayahReference: z.string().regex(/^\d{1,3}:\d{1,3}(-\d{1,3})?$/).optional(),
  /** Authenticity assessment for this specific report */
  grade: AuthenticityGrade,
  /** Optional editorial note about isnad, variant readings, etc. */
  note: LocalizedString.optional(),
});
export type Citation = z.infer<typeof Citation>;

/** At least one citation required wherever this is used. */
export const Citations = z.array(Citation).min(1, "At least one source citation is required.");
export type Citations = z.infer<typeof Citations>;
