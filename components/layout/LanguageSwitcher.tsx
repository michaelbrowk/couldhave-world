import Link from "next/link";
import { LOCALES, type Locale } from "@/app/[locale]/dictionaries";

type Props = {
  currentLocale: Locale;
};

const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  es: "ES",
  de: "DE",
  fr: "FR",
};

export function LanguageSwitcher({ currentLocale }: Props) {
  return (
    <nav aria-label="Language" className="flex gap-4 font-mono text-xs uppercase tracking-[0.18em]">
      {LOCALES.map((loc) => {
        const isCurrent = loc === currentLocale;
        return (
          <Link
            key={loc}
            href={`/${loc}/`}
            aria-current={isCurrent ? "page" : undefined}
            className={
              isCurrent
                ? "text-[var(--text-primary)]"
                : "text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
            }
          >
            {LOCALE_LABELS[loc]}
          </Link>
        );
      })}
    </nav>
  );
}
