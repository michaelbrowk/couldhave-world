"use client";

import { useEffect, useState } from "react";
import { TickingCounter } from "@/components/hero/TickingCounter";
import type { Source } from "@/data/sources.schema";
import { formatCompact, formatCurrency, type SupportedLocale } from "@/lib/formatters";
import { isProjectionPeriodComplete } from "@/lib/projection";

type Strings = {
  caption: string;
  rate: string;
  methodology: string;
  sourcesToggle: string;
  updatedTemplate: string;
  counterPeriodEnded: string;
};

type Props = {
  source: Source;
  locale: SupportedLocale;
  strings: Strings;
};

export function SourceHero({ source, locale, strings }: Props) {
  const { projection, currentYear } = source;
  const [periodComplete, setPeriodComplete] = useState(false);
  useEffect(() => {
    const checkPeriod = () =>
      setPeriodComplete(isProjectionPeriodComplete(currentYear, new Date()));
    checkPeriod();
    const interval = window.setInterval(checkPeriod, 60_000);
    return () => window.clearInterval(interval);
  }, [currentYear]);
  const secondsInCurrentYear =
    (Date.UTC(currentYear + 1, 0, 1) - Date.UTC(currentYear, 0, 1)) / 1000;
  const perSecondUsd = projection.totalUsd / secondsInCurrentYear;
  const perDayUsd = perSecondUsd * 86_400;

  const rateText = strings.rate
    .replace("{perDay}", formatCompact(perDayUsd, locale))
    .replace("{perSecond}", formatCurrency(Math.round(perSecondUsd), locale));
  const updatedDate = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${source.lastUpdated}T00:00:00Z`));

  return (
    <section
      role="tabpanel"
      id="source-tabpanel"
      aria-labelledby={`source-tab-${source.id}`}
      className="mb-16 md:mb-24 fadein"
      key={source.id}
    >
      <h1
        className="font-serif text-2xl md:text-4xl text-[var(--text-primary)] mb-3 leading-tight"
        style={{ minHeight: "1.2em" }}
      >
        {strings.caption}
      </h1>
      <TickingCounter projection={projection} currentYear={currentYear} locale={locale} />
      <p
        className="font-mono text-xs md:text-sm uppercase tracking-[0.18em] text-[var(--text-secondary)] mt-3 tabular-nums"
        style={{ minHeight: "1.2em" }}
      >
        {periodComplete
          ? strings.counterPeriodEnded.replace("{year}", String(currentYear))
          : rateText}
      </p>
      <p className="font-sans text-xs md:text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed mt-4">
        {strings.methodology}
      </p>
      <details className="font-mono text-xs text-[var(--text-secondary)] max-w-2xl mt-4">
        <summary className="cursor-pointer uppercase tracking-widest hover:text-[var(--accent)] transition-colors">
          {strings.sourcesToggle}
        </summary>
        <p className="mt-3">
          <a
            href={source.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-[var(--accent)]"
          >
            {source.source}
          </a>
        </p>
        <p lang="en" className="mt-3 font-sans leading-relaxed">
          {projection.growthBasis}
        </p>
        <p className="mt-3">
          <time dateTime={source.lastUpdated}>
            {strings.updatedTemplate.replace("{date}", updatedDate)}
          </time>
        </p>
      </details>
    </section>
  );
}
