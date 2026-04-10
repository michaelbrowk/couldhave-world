import { notFound } from "next/navigation";
import { FadeInOnScroll } from "@/components/common/FadeInOnScroll";
import { TickingCounter } from "@/components/hero/TickingCounter";
import { militarySpending } from "@/data/military-spending.schema";
import type { SupportedLocale } from "@/lib/formatters";
import { getDictionary, hasLocale, interpolate } from "./dictionaries";

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

  return (
    <main>
      <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-10">
        <TickingCounter
          projection={projection}
          currentYear={currentYear}
          locale={locale as SupportedLocale}
        />
        <FadeInOnScroll delay={0.3}>
          <p className="font-serif text-2xl md:text-4xl max-w-3xl text-[var(--text-primary)]">
            {captionText}
          </p>
        </FadeInOnScroll>
        <FadeInOnScroll delay={0.6}>
          <p className="font-sans text-sm text-[var(--text-secondary)] max-w-md leading-relaxed">
            {methodologyText}
          </p>
        </FadeInOnScroll>
        <FadeInOnScroll delay={1.0}>
          <div
            className="font-sans text-xs text-[var(--text-secondary)] uppercase tracking-widest mt-12"
            aria-hidden="true"
          >
            {dict.hero.scrollHint} ↓
          </div>
        </FadeInOnScroll>
      </section>
    </main>
  );
}
