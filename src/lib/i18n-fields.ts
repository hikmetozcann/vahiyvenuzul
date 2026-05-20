import type { Locale } from "@/i18n/config";
import { defaultLocale } from "@/i18n/config";
import type { LocalizedString } from "@/schemas/common";

/**
 * Picks a translation with fallback to the editorial base language (TR),
 * then to any non-empty translation. UI must never render `undefined`.
 */
export function tr(field: LocalizedString | undefined, locale: Locale): string {
  if (!field) return "";
  const direct = field[locale];
  if (direct) return direct;
  const fallback = field[defaultLocale];
  if (fallback) return fallback;
  for (const value of Object.values(field)) {
    if (value) return value;
  }
  return "";
}
