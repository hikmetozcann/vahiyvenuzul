import { z } from "zod";
import { LocalizedString } from "./common";

export const Place = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: LocalizedString,
  region: LocalizedString.optional(),
  modernCountry: z.string().optional(),
  coordinates: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
    .optional(),
  description: LocalizedString.optional(),
});
export type Place = z.infer<typeof Place>;
