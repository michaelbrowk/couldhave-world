import { notFound } from "next/navigation";
import { CategoryRow, type CategoryRowStrings } from "@/components/categories/CategoryRow";
import { TickingCounter } from "@/components/hero/TickingCounter";
import { Footer } from "@/components/layout/Footer";
import { Methodology } from "@/components/layout/Methodology";
import { categories } from "@/data/categories.schema";
import { militarySpending } from "@/data/military-spending.schema";
import { formatCompact, formatCurrency, type SupportedLocale } from "@/lib/formatters";
import {
  type Dictionary,
  getCategoryDictKey,
  getDictionary,
  hasLocale,
  interpolate,
  type Locale,
} from "./dictionaries";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const { currentYear, projection } = militarySpending;

  const captionText = interpolate(dict.hero.caption, { year: currentYear });
  const methodologyText = interpolate(dict.hero.methodology, {
    year: currentYear,
    basedOnYear: projection.basedOnYear,
  });
  const militaryBarLabel = interpolate(dict.categories.military, { year: currentYear });

  // Constant rates derived from the projected annual total. The number of
  // seconds in the current year accounts for leap years (2026 is not, 2028 is).
  const secondsInCurrentYear =
    (Date.UTC(currentYear + 1, 0, 1) - Date.UTC(currentYear, 0, 1)) / 1000;
  const perSecondUsd = projection.totalUsd / secondsInCurrentYear;
  const perDayUsd = perSecondUsd * 86_400;
  const rateText = interpolate(dict.hero.rate, {
    perDay: formatCompact(perDayUsd, locale as SupportedLocale),
    perSecond: formatCurrency(Math.round(perSecondUsd), locale as SupportedLocale),
  });

  return (
    <main className="min-h-screen w-full">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-12 md:py-20">
        {/* Hero — left-aligned, compact column, large typography */}
        <section className="mb-16 md:mb-24">
          <p className="font-serif text-2xl md:text-4xl text-[var(--text-primary)] mb-2">
            {captionText}
          </p>
          <TickingCounter
            projection={projection}
            currentYear={currentYear}
            locale={locale as SupportedLocale}
          />
          <p className="font-mono text-xs md:text-sm uppercase tracking-[0.18em] text-[var(--text-secondary)] mt-3 tabular-nums">
            {rateText}
          </p>
          <p className="font-sans text-xs md:text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed mt-4">
            {methodologyText}
          </p>
        </section>

        {/* Section heading + category ledger */}
        <section>
          <h2 className="font-serif text-3xl md:text-5xl text-[var(--text-primary)] mb-8 md:mb-12">
            {dict.transition.headline}
          </h2>
          <div>
            {categories.map((category) => {
              const strings = buildCategoryStrings(dict, category.id, militaryBarLabel);
              return (
                <CategoryRow
                  key={category.id}
                  category={category}
                  projection={projection}
                  currentYear={currentYear}
                  locale={locale as SupportedLocale}
                  strings={strings}
                />
              );
            })}
          </div>
        </section>

        <Methodology strings={dict.methodology} />

        <Footer currentLocale={locale as Locale} yearTemplate={dict.footer.year} />
      </div>
    </main>
  );
}

function buildCategoryStrings(
  dict: Dictionary,
  categoryId: string,
  militaryBarLabel: string,
): CategoryRowStrings {
  const key = getCategoryDictKey(categoryId);
  const entry = dict.categories[key];
  const compareUnit = "compareUnit" in entry ? entry.compareUnit : entry.title;
  return {
    title: entry.title,
    unit: entry.unit,
    militaryBarLabel,
    alternativeBarLabel: compareUnit,
    sourcesToggle: dict.categories.sourcesToggle,
  };
}
