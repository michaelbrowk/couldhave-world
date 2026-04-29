"use client";

import { CategoryRow, type CategoryRowStrings } from "@/components/categories/CategoryRow";
import type { Source } from "@/data/sources.schema";
import type { SupportedLocale } from "@/lib/formatters";
import type { Projection } from "@/lib/projection";

type DictCategoryEntry = {
  title: string;
  unit: string;
  compareUnit?: string;
};

type Strings = {
  headline: string;
  sourceLabel: string; // e.g. "Military spending 2026"
  sourcesToggle: string;
  categories: Record<string, DictCategoryEntry>; // keyed by short dict key
  shortKeyFor: (categoryId: string) => string; // mapping fn from data id to dict key
};

type Props = {
  source: Source;
  locale: SupportedLocale;
  strings: Strings;
};

export function SourceCategories({ source, locale, strings }: Props) {
  return (
    <section className="motion-safe:animate-[fadein_240ms_ease-out]" key={source.id}>
      <h2 className="font-serif text-3xl md:text-5xl text-[var(--text-primary)] mb-8 md:mb-12">
        {strings.headline}
      </h2>
      <div>
        {source.categories.map((category) => {
          const shortKey = strings.shortKeyFor(category.id);
          const entry = strings.categories[shortKey];
          if (!entry) return null;
          const compareUnit = entry.compareUnit ?? entry.title;
          const rowStrings: CategoryRowStrings = {
            title: entry.title,
            unit: entry.unit,
            militaryBarLabel: strings.sourceLabel,
            alternativeBarLabel: compareUnit,
            sourcesToggle: strings.sourcesToggle,
          };
          // source.projection.growthFactor is optional in the schema (flat-annual
          // sources omit it) but lib/projection.Projection marks it required.
          // Task 1 established shape parity; cast to satisfy CategoryRow's prop.
          const projection = source.projection as Projection;
          return (
            <CategoryRow
              key={category.id}
              category={category}
              projection={projection}
              currentYear={source.currentYear}
              locale={locale}
              strings={rowStrings}
            />
          );
        })}
      </div>
    </section>
  );
}
