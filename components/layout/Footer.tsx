import type { Locale } from "@/app/[locale]/dictionaries";
import { interpolate } from "@/app/[locale]/dictionaries";
import { LanguageSwitcher } from "./LanguageSwitcher";

type Props = {
  currentLocale: Locale;
  yearTemplate: string;
};

export function Footer({ currentLocale, yearTemplate }: Props) {
  const year = new Date().getUTCFullYear();
  const yearText = interpolate(yearTemplate, { year });

  return (
    <footer className="py-12 border-t border-[var(--border-color)] flex items-center justify-between gap-6 font-mono text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">
      <span>{yearText}</span>
      <LanguageSwitcher currentLocale={currentLocale} />
    </footer>
  );
}
