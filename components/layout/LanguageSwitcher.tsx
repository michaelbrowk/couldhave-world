"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Locale } from "@/app/[locale]/dictionaries";
import { DEFAULT_SOURCE_ID } from "@/lib/site-config";
import { parseSourceId, type SourceId } from "@/lib/sources";

type Props = {
  currentLocale: Locale;
};

const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  es: "ES",
  de: "DE",
  fr: "FR",
};

export function LanguageSwitcherView({
  currentLocale,
  sourceId = DEFAULT_SOURCE_ID,
}: Props & { sourceId?: SourceId }) {
  const query = sourceId === DEFAULT_SOURCE_ID ? "" : `?source=${sourceId}`;
  return (
    <nav aria-label="Language" className="flex gap-4 font-mono text-xs uppercase tracking-[0.18em]">
      {(Object.keys(LOCALE_LABELS) as Locale[]).map((loc) => {
        const isCurrent = loc === currentLocale;
        return (
          <Link
            key={loc}
            href={`/${loc}/${query}`}
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

export function LanguageSwitcher(props: Props) {
  const params = useSearchParams();
  const sourceId = parseSourceId(params.get("source")) ?? DEFAULT_SOURCE_ID;
  return <LanguageSwitcherView {...props} sourceId={sourceId} />;
}
