export const locales = ["tr", "en", "ar"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "tr";

export const localeNames: Record<Locale, string> = {
  tr: "Türkçe",
  en: "English",
  ar: "العربية",
};

export const rtlLocales: ReadonlySet<Locale> = new Set(["ar"]);

export function isRtl(locale: Locale): boolean {
  return rtlLocales.has(locale);
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
