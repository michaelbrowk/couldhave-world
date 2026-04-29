"use client";

import type { Source, SourceId } from "@/data/sources.schema";
import { TickingCounter } from "@/components/hero/TickingCounter";
import { formatCompact, formatCurrency, type SupportedLocale } from "@/lib/formatters";

type Strings = {
  caption: string;
  rate: string;
  methodology: string;
};

type Props = {
  source: Source;
  locale: SupportedLocale;
  strings: Strings;
};

export function SourceHero({ source, locale, strings }: Props) {
  const { projection, currentYear } = source;
  const secondsInCurrentYear =
    (Date.UTC(currentYear + 1, 0, 1) - Date.UTC(currentYear, 0, 1)) / 1000;
  const perSecondUsd = projection.totalUsd / secondsInCurrentYear;
  const perDayUsd = perSecondUsd * 86_400;

  const rateText = strings.rate
    .replace("{perDay}", formatCompact(perDayUsd, locale))
    .replace("{perSecond}", formatCurrency(Math.round(perSecondUsd), locale));

  return (
    <section
      role="tabpanel"
      id="source-tabpanel"
      aria-labelledby={`source-tab-${source.id satisfies SourceId}`}
      className="mb-16 md:mb-24 motion-safe:animate-[fadein_240ms_ease-out]"
      key={source.id}
    >
      <p
        className="font-serif text-2xl md:text-4xl text-[var(--text-primary)] mb-2"
        style={{ minHeight: "1.2em" }}
      >
        {strings.caption}
      </p>
      <TickingCounter projection={projection} currentYear={currentYear} locale={locale} />
      <p
        className="font-mono text-xs md:text-sm uppercase tracking-[0.18em] text-[var(--text-secondary)] mt-3 tabular-nums"
        style={{ minHeight: "1.2em" }}
      >
        {rateText}
      </p>
      <p className="font-sans text-xs md:text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed mt-4">
        {strings.methodology}
      </p>
    </section>
  );
}
