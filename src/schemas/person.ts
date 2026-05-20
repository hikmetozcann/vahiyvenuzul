import { z } from "zod";
import { LocalizedString } from "./common";
import { Citations } from "./source";

export const PersonRole = z.enum([
  "prophet",
  "family",
  "companion",
  "wife",
  "child",
  "opponent",
  "ahl-al-kitab",
  "ruler",
  "angel",
  "prophet-other",
  "successor",
]);
export type PersonRole = z.infer<typeof PersonRole>;

export const Person = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: LocalizedString,
  kunya: LocalizedString.optional(),
  nasab: LocalizedString.optional(),
  roles: z.array(PersonRole).min(1),
  birthYearGregorian: z.number().int().optional(),
  deathYearHijri: z.number().int().optional(),
  deathYearGregorian: z.number().int().optional(),
  bio: LocalizedString.optional(),
  sources: Citations,
});
export type Person = z.infer<typeof Person>;
