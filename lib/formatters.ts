export type SupportedLocale = "en" | "ru" | "es" | "de" | "fr";

export function formatCurrency(amount: number, locale: SupportedLocale): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCount(count: number, locale: SupportedLocale): string {
  let rounded: number;
  if (count >= 1_000_000) {
    rounded = Math.round(count / 1_000_000) * 1_000_000;
  } else if (count >= 10_000) {
    rounded = Math.round(count / 10_000) * 10_000;
  } else {
    rounded = Math.round(count);
  }
  return new Intl.NumberFormat(locale).format(rounded);
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
