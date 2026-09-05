export type SupportedLocale = "en" | "es" | "de" | "fr";

// Reuse ICU formatters: counters and category rows format values on every tick.
// Constructing them repeatedly was needless work on the browser's main thread.
const formatterCache = new Map<string, Intl.NumberFormat>();
function formatter(locale: SupportedLocale, kind: string, options: Intl.NumberFormatOptions) {
  const key = `${locale}:${kind}`;
  let cached = formatterCache.get(key);
  if (!cached) {
    cached = new Intl.NumberFormat(locale, options);
    formatterCache.set(key, cached);
  }
  return cached;
}

export function formatCurrency(amount: number, locale: SupportedLocale): string {
  return formatter(locale, "currency", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCount(count: number, locale: SupportedLocale): string {
  if (count < 100) {
    return formatter(locale, "small-count", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(count);
  }
  return formatter(locale, "large-count", { maximumFractionDigits: 0 }).format(count);
}

export function formatCompact(amount: number, locale: SupportedLocale): string {
  return formatter(locale, "compact", {
    notation: "compact",
    compactDisplay: "short",
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(amount);
}
