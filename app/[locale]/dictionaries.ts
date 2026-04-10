import "server-only";

const dictionaries = {
  en: () => import("@/messages/en.json").then((m) => m.default),
  ru: () => import("@/messages/ru.json").then((m) => m.default),
  es: () => import("@/messages/es.json").then((m) => m.default),
  de: () => import("@/messages/de.json").then((m) => m.default),
  fr: () => import("@/messages/fr.json").then((m) => m.default),
} as const;

export const LOCALES = ["en", "ru", "es", "de", "fr"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const hasLocale = (value: string): value is Locale =>
  (LOCALES as readonly string[]).includes(value);

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)[Locale]>>;

export const getDictionary = async (locale: Locale): Promise<Dictionary> => dictionaries[locale]();

/**
 * Interpolate placeholders like {year} in a translated string.
 * Server-side helper, fully type-safe at the call site.
 */
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const v = values[key];
    return v === undefined ? `{${key}}` : String(v);
  });
}
