import { z } from "zod";

/**
 * Historical date model supporting:
 * - Hijri calendar (post-Hijra)
 * - "BH" (Before Hijra) — used for events before 1 AH
 * - Gregorian (CE) as a parallel reference
 * - yearFromBirth — calculated from the Prophet's birth (≈ 570 CE), useful
 *   for the pre-prophetic period and a single monotonic axis for timelines.
 *
 * All fields optional individually but at least one anchor must exist.
 * The renderer decides which to display per locale/context.
 */
export const HistoricalDate = z
  .object({
    hijri: z
      .string()
      .regex(/^(BH\s+)?\d{1,3}(\s+\/\s+(Muharram|Safar|Rabi'\sal-Awwal|Rabi'\sal-Thani|Jumada\sal-Awwal|Jumada\sal-Thani|Rajab|Sha'ban|Ramadan|Shawwal|Dhu\sal-Qi'dah|Dhu\sal-Hijjah))?$/i)
      .optional()
      .describe('Hijri year, optionally with month. Use "BH N" for N years before Hijra.'),
    gregorianYear: z.number().int().min(500).max(800).optional(),
    gregorianMonth: z.number().int().min(1).max(12).optional(),
    gregorianDay: z.number().int().min(1).max(31).optional(),
    yearFromBirth: z.number().int().min(0).max(80).optional(),
    yearFromProphethood: z.number().int().min(0).max(30).optional(),
    approximate: z.boolean().optional().default(false),
    note: z.string().optional(),
  })
  .refine(
    (d) =>
      d.hijri !== undefined ||
      d.gregorianYear !== undefined ||
      d.yearFromBirth !== undefined ||
      d.yearFromProphethood !== undefined,
    { message: "At least one date anchor (hijri / gregorianYear / yearFromBirth / yearFromProphethood) is required." },
  );

export type HistoricalDate = z.infer<typeof HistoricalDate>;
