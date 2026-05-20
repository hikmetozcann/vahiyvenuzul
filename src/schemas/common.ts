import { z } from "zod";
import { locales } from "@/i18n/config";

/**
 * Translatable string. At least Turkish ("tr") is required as the editorial
 * base language; others are optional and rendered with fallback.
 */
export const localized = <T extends z.ZodTypeAny>(inner: T) => {
  const shape: Record<string, z.ZodOptional<T> | T> = {};
  for (const locale of locales) {
    shape[locale] = locale === "tr" ? inner : inner.optional();
  }
  return z.object(shape).strict();
};

export const LocalizedString = localized(z.string().min(1));
export const LocalizedRichText = localized(z.string().min(1));

export type LocalizedString = z.infer<typeof LocalizedString>;
