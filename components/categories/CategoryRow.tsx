"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Category } from "@/data/sources.schema";
import { computeCategoryMetric, computeSymbolCount, pickMatrixMode } from "@/lib/categories";
import { formatCompact, formatCount, type SupportedLocale } from "@/lib/formatters";
import { currentSpendEstimate, type Projection } from "@/lib/projection";
import { CategorySymbol } from "./CategorySymbol";
import { ComparisonBars } from "./ComparisonBars";
import { SymbolMatrix } from "./SymbolMatrix";

export type CategoryRowStrings = {
  title: string;
  unit: string;
  militaryBarLabel: string;
  alternativeBarLabel: string;
  sourcesToggle: string;
  aiBenefitLabel: string;
};

type Props = {
  category: Category;
  projection: Projection;
  currentYear: number;
  locale: SupportedLocale;
  strings: CategoryRowStrings;
};

/**
 * Card-shaped ledger row. Default state shows title (left), number + unit
 * (right) inside a soft gray plate. Clicking the card expands it inline to
 * reveal comparison bars, the symbol matrix, and source citations.
 *
 * The headline metric (people treated, years funded, times-over) is derived
 * from live year-to-date spend, so it stays mathematically consistent with
 * the large hero counter and the comparison bar value. One source of truth —
 * `currentSpendEstimate(projection, now, currentYear)` — drives everything.
 */
export function CategoryRow({ category, projection, currentYear, locale, strings }: Props) {
  const reduceMotion = useReducedMotion();
  // Live YTD spend, ticked every 100ms to match the hero counter cadence.
  // The static fallback uses its build time; the URL-aware subtree mounts
  // with the visitor's time and the interval then takes over.
  const [currentSpend, setCurrentSpend] = useState<number>(() =>
    currentSpendEstimate(projection, new Date(), currentYear),
  );

  useEffect(() => {
    if (reduceMotion) return;
    const tick = () => setCurrentSpend(currentSpendEstimate(projection, new Date(), currentYear));
    tick();
    const interval = window.setInterval(tick, 100);
    return () => window.clearInterval(interval);
  }, [projection, currentYear, reduceMotion]);

  const metric = computeCategoryMetric(category, currentSpend);
  const mode = pickMatrixMode(metric);
  const symbolCount = computeSymbolCount(metric, mode);

  const numberDisplay = formatCount(metric, locale);
  const alternativeDisplay = formatCompact(category.unitCostUsd, locale);

  const matrixAriaLabel =
    mode === "dense"
      ? `${symbolCount.visibleCount} × ${formatCount(
          symbolCount.unitsPerSymbol,
          locale,
        )} ${strings.unit}`
      : `${symbolCount.visibleCount} ${strings.unit}`;

  return (
    <details
      open
      data-category-id={category.id}
      className="group border-t border-[var(--border-color)] last:border-b last:border-[var(--border-color)]"
    >
      <summary className="cursor-pointer py-6 md:py-8 flex items-baseline justify-between gap-6 hover:opacity-100 opacity-95 transition-opacity">
        <span className="font-serif text-xl md:text-3xl text-[var(--text-primary)] flex-1 min-w-0 leading-tight">
          {strings.title}
        </span>
        <span className="flex flex-col items-end sm:flex-row sm:items-baseline gap-2 sm:gap-3 md:gap-4 shrink-0 max-w-[55%] sm:max-w-[60%]">
          <span
            className="font-serif text-[var(--accent)] tabular-nums leading-none shrink-0"
            style={{ fontSize: "clamp(32px, 5vw, 72px)" }}
            // Static export freezes the HTML at build time, but the initial
            // client render uses the visitor's wall clock — the two values
            // differ by whatever time has passed since deploy. Suppressing
            // the hydration warning lets React accept the fresher client
            // value silently, matching the pattern in TickingCounter.
            suppressHydrationWarning
          >
            {numberDisplay}
          </span>
          <span className="font-mono text-[10px] md:text-xs uppercase tracking-[0.12em] leading-snug text-[var(--text-secondary)] max-w-[24ch] [overflow-wrap:anywhere] text-right sm:text-left">
            {strings.unit}
          </span>
        </span>
      </summary>

      <div className="pb-12 md:pb-16 pt-2 flex flex-col items-stretch gap-12">
        <div className="w-full pt-12">
          <ComparisonBars
            projection={projection}
            currentSpend={currentSpend}
            militaryLabel={strings.militaryBarLabel}
            alternativeLabel={strings.alternativeBarLabel}
            alternativeDisplay={alternativeDisplay}
            alternativeAmount={category.unitCostUsd}
            locale={locale}
          />
        </div>
        <div className="space-y-4">
          <SymbolMatrix symbol={category.symbol} count={symbolCount} ariaLabel={matrixAriaLabel} />
          <p className="flex items-center gap-2 font-mono text-xs text-[var(--text-secondary)]">
            <span>1</span>
            <span aria-hidden="true">
              <CategorySymbol symbol={category.symbol} size={14} />
            </span>
            <span>
              = {formatCount(symbolCount.unitsPerSymbol, locale)} {strings.unit}
            </span>
          </p>
        </div>
        {category.aiBenefit ? (
          <aside className="max-w-xl border-t border-[var(--border-color)] pt-8">
            <p className="font-mono text-[10px] md:text-xs uppercase tracking-widest text-[var(--text-primary)] mb-3">
              {strings.aiBenefitLabel}
            </p>
            <p
              lang="en"
              className="font-serif text-base md:text-lg text-[var(--text-primary)] leading-relaxed"
            >
              {category.aiBenefit.text}
            </p>
            <ul className="mt-4 space-y-1 list-none font-mono text-xs text-[var(--text-secondary)]">
              {category.aiBenefit.sources.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-[var(--border-color)] underline-offset-4 hover:text-[var(--accent)] hover:decoration-[var(--accent)] transition-[color,text-decoration-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]"
                  >
                    {s.name} ({s.year})
                    <span aria-hidden="true" className="ml-1 text-[0.85em] opacity-70">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
        <details className="font-mono text-xs text-[var(--text-secondary)] max-w-xl">
          <summary className="cursor-pointer uppercase tracking-widest hover:text-[var(--accent)] transition-colors duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]">
            {strings.sourcesToggle}
          </summary>
          <ul className="mt-3 space-y-1 list-none text-left">
            {category.sources.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-[var(--border-color)] underline-offset-4 hover:text-[var(--accent)] hover:decoration-[var(--accent)] transition-[color,text-decoration-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]"
                >
                  {s.name} ({s.year})
                </a>
              </li>
            ))}
          </ul>
          <p
            lang="en"
            className="mt-3 italic text-left font-sans normal-case tracking-normal leading-relaxed"
          >
            {category.methodology}
          </p>
        </details>
      </div>
    </details>
  );
}
