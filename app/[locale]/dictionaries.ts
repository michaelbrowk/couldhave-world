import "server-only";
import { SOURCES_LIST } from "@/data/sources.index";
import enDict from "@/messages/en.json";

const dictionaries = {
  en: () => Promise.resolve(enDict),
  es: () => import("@/messages/es.json").then((m) => withFallback(m.default, enDict)),
  de: () => import("@/messages/de.json").then((m) => withFallback(m.default, enDict)),
  fr: () => import("@/messages/fr.json").then((m) => withFallback(m.default, enDict)),
} as const;

export const LOCALES = ["en", "es", "de", "fr"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const hasLocale = (value: string): value is Locale =>
  (LOCALES as readonly string[]).includes(value);

export type Dictionary = typeof enDict;

export const getDictionary = async (locale: Locale): Promise<Dictionary> =>
  dictionaries[locale]() as Promise<Dictionary>;

/**
 * Recursively merge a partial locale dict on top of the EN fallback so any
 * key missing in the locale falls back to EN. The fallback shape (`enDict`)
 * is the canonical Dictionary type.
 */
function withFallback<T>(partial: unknown, fallback: T): T {
  if (
    typeof partial !== "object" ||
    partial === null ||
    typeof fallback !== "object" ||
    fallback === null
  ) {
    return (partial ?? fallback) as T;
  }
  const out: Record<string, unknown> = { ...(fallback as Record<string, unknown>) };
  for (const [k, v] of Object.entries(partial as Record<string, unknown>)) {
    out[k] = withFallback(v, (fallback as Record<string, unknown>)[k]);
  }
  return out as T;
}

export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const v = values[key];
    return v === undefined ? `{${key}}` : String(v);
  });
}

/**
 * Maps a `Category.id` (kebab-case, full descriptor) to the short dict key
 * used inside `messages/*.json` under `categories.<sourceId>.<key>`.
 *
 * Per-source mapping — the same category id can map to different short keys
 * across sources, but in practice the convention is to keep the same key,
 * with the source namespace providing the differentiator. Adding a new
 * (sourceId, categoryId) pair here is required when adding a new entry to
 * any data/sources/*.json file.
 */
export const CATEGORY_DICT_KEYS: Record<string, Record<string, string>> = Object.fromEntries(
  SOURCES_LIST.map((source) => [
    source.id,
    Object.fromEntries(
      source.categories.map((category) => {
        const key = category.titleKey.split(".")[2];
        if (!key) throw new Error(`Invalid title key: ${category.titleKey}`);
        return [category.id, key];
      }),
    ),
  ]),
);

export function getCategoryDictKey(sourceId: string, categoryId: string): string {
  const sourceMap = CATEGORY_DICT_KEYS[sourceId];
  if (!sourceMap) throw new Error(`No dict mapping for source: ${sourceId}`);
  const key = sourceMap[categoryId];
  if (!key) throw new Error(`No dict mapping for ${sourceId}/${categoryId}`);
  return key;
}
