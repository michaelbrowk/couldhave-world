import { FadeInOnScroll } from "@/components/common/FadeInOnScroll";
import type { Category, CategorySource } from "@/data/categories.schema";
import { computeCategoryMetric, computeSymbolCount, pickMatrixMode } from "@/lib/categories";
import { formatCompact, formatCount, type SupportedLocale } from "@/lib/formatters";
import { ComparisonBars } from "./ComparisonBars";
import { SymbolMatrix } from "./SymbolMatrix";

export type CategoryBlockStrings = {
  /** Headline of the category, e.g. "Cured cancer worldwide". */
  title: string;
  /** Unit label under the big number, e.g. "people cured". */
  unit: string;
  /** Label of the larger comparison bar, e.g. "Military spending 2026". */
  militaryBarLabel: string;
  /** Label of the smaller comparison bar, e.g. "One cancer treatment". */
  alternativeBarLabel: string;
  /** "See sources" toggle text. */
  sourcesToggle: string;
};

type Props = {
  category: Category;
  militaryTotalUsd: number;
  locale: SupportedLocale;
  strings: CategoryBlockStrings;
};

export function CategoryBlock({ category, militaryTotalUsd, locale, strings }: Props) {
  const metric = computeCategoryMetric(category, militaryTotalUsd);
  const mode = pickMatrixMode(metric);
  const symbolCount = computeSymbolCount(metric, mode);

  const numberDisplay = formatCount(metric, locale);
  const militaryDisplay = formatCompact(militaryTotalUsd, locale);
  const alternativeDisplay = formatCompact(category.unitCostUsd, locale);

  const matrixAriaLabel =
    mode === "dense"
      ? `${symbolCount.visibleCount} symbols. Each symbol represents ${formatCount(
          symbolCount.unitsPerSymbol,
          locale,
        )} ${strings.unit}.`
      : `${symbolCount.visibleCount} ${strings.unit}.`;

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 py-24 gap-12 text-center">
      <FadeInOnScroll>
        <h2
          className="font-serif leading-[0.95] text-[var(--text-primary)] max-w-5xl"
          style={{ fontSize: "clamp(40px, 7vw, 110px)" }}
        >
          {strings.title}
        </h2>
      </FadeInOnScroll>

      <FadeInOnScroll delay={0.2}>
        <div
          className="font-serif leading-none text-[var(--accent)] tabular-nums tracking-tight"
          style={{ fontSize: "clamp(56px, 11vw, 180px)" }}
        >
          {numberDisplay}
        </div>
      </FadeInOnScroll>

      <FadeInOnScroll delay={0.35}>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--text-secondary)]">
          {strings.unit}
        </p>
      </FadeInOnScroll>

      <FadeInOnScroll delay={0.5} className="w-full flex justify-center">
        <ComparisonBars
          militaryLabel={strings.militaryBarLabel}
          militaryDisplay={militaryDisplay}
          militaryAmount={militaryTotalUsd}
          alternativeLabel={strings.alternativeBarLabel}
          alternativeDisplay={alternativeDisplay}
          alternativeAmount={category.unitCostUsd}
        />
      </FadeInOnScroll>

      <FadeInOnScroll delay={0.7} className="w-full flex justify-center">
        <SymbolMatrix symbol={category.symbol} count={symbolCount} ariaLabel={matrixAriaLabel} />
      </FadeInOnScroll>

      <FadeInOnScroll delay={0.9}>
        <SourceFootnote
          sources={category.sources}
          methodology={category.methodology}
          toggleText={strings.sourcesToggle}
        />
      </FadeInOnScroll>
    </section>
  );
}

function SourceFootnote({
  sources,
  methodology,
  toggleText,
}: {
  sources: CategorySource[];
  methodology: string;
  toggleText: string;
}) {
  return (
    <details className="font-mono text-xs text-[var(--text-secondary)] max-w-xl">
      <summary className="cursor-pointer uppercase tracking-widest hover:text-[var(--accent)] transition-colors">
        {toggleText}
      </summary>
      <ul className="mt-3 space-y-1 list-none text-left">
        {sources.map((s) => (
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
        {methodology}
      </p>
    </details>
  );
}
