export type SupportedLocale = "en" | "es" | "de" | "fr";

export function formatCurrency(amount: number, locale: SupportedLocale): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCount(count: number, locale: SupportedLocale): string {
  // Small metrics (years of funding, "X times over") need decimal precision so
  // the live ticker can show gradual accumulation instead of jumping integers.
  if (count < 100) {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(count);
  }
  // Larger metrics (people treated, school places) show full integer with
  // thousand separators — the rendered value ticks visibly at ~1-20/sec
  // depending on unit cost, which would not read as a change if we rounded
  // to the nearest million.
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(count);
}

export function formatCompact(amount: number, locale: SupportedLocale): string {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    compactDisplay: "short",
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 1,
  }).format(amount);
}
