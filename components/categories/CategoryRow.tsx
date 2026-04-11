"use client";

import { useEffect, useState } from "react";
import type { Category } from "@/data/categories.schema";
import { computeCategoryMetric, computeSymbolCount, pickMatrixMode } from "@/lib/categories";
import { formatCompact, formatCount, type SupportedLocale } from "@/lib/formatters";
import { currentSpendEstimate, type Projection } from "@/lib/projection";
import { ComparisonBars } from "./ComparisonBars";
import { SymbolMatrix } from "./SymbolMatrix";

export type CategoryRowStrings = {
  title: string;
  unit: string;
  militaryBarLabel: string;
  alternativeBarLabel: string;
  sourcesToggle: string;
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
  // Live YTD spend, ticked every 100ms to match the hero counter cadence.
  // Seeded with a deterministic initial value so SSR and the first client
  // render produce identical markup; the interval then takes over.
  const [currentSpend, setCurrentSpend] = useState<number>(() =>
    currentSpendEstimate(projection, new Date(), currentYear),
  );

  useEffect(() => {
    const tick = () => setCurrentSpend(currentSpendEstimate(projection, new Date(), currentYear));
    tick();
    const interval = window.setInterval(tick, 100);
    return () => window.clearInterval(interval);
  }, [projection, currentYear]);

  const metric = computeCategoryMetric(category, currentSpend);
  const mode = pickMatrixMode(metric);
  const symbolCount = computeSymbolCount(metric, mode);

  const numberDisplay = formatCount(metric, locale);
  const alternativeDisplay = formatCompact(category.unitCostUsd, locale);

  const matrixAriaLabel =
    mode === "dense"
      ? `${symbolCount.visibleCount} symbols, each representing ${formatCount(
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
        <span className="flex items-baseline gap-3 md:gap-4 shrink-0">
          <span
            className="font-serif text-[var(--accent)] tabular-nums leading-none"
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
          <span className="font-mono text-[10px] md:text-xs uppercase tracking-[0.15em] text-[var(--text-secondary)] hidden sm:inline">
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
        <SymbolMatrix symbol={category.symbol} count={symbolCount} ariaLabel={matrixAriaLabel} />
        <details className="font-mono text-xs text-[var(--text-secondary)] max-w-xl">
          <summary className="cursor-pointer uppercase tracking-widest hover:text-[var(--accent)] transition-colors">
            {strings.sourcesToggle}
          </summary>
          <ul className="mt-3 space-y-1 list-none text-left">
            {category.sources.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-[var(--border-color)] underline-offset-4 hover:text-[var(--accent)] hover:decoration-[var(--accent)] transition-colors"
                >
                  {s.name} ({s.year})
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-3 italic text-left font-sans normal-case tracking-normal leading-relaxed">
            {category.methodology}
          </p>
        </details>
      </div>
    </details>
  );
}
