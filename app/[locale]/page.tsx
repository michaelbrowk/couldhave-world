import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Footer } from "@/components/layout/Footer";
import { Methodology } from "@/components/layout/Methodology";
import { SourceSwitcher, SourceSwitcherView } from "@/components/sources/SourceSwitcher";
import type { SupportedLocale } from "@/lib/formatters";
import { CATEGORY_DICT_KEYS, getDictionary, hasLocale, type Locale } from "./dictionaries";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dict = await getDictionary(locale);

  // Both branches share these props. The Suspense fallback bakes the
  // default 'ai' state into the static HTML; the real SourceSwitcher
  // takes over on hydration and reads ?source= from the URL.
  // Without this, post-hydration content swap caused a 0.6 CLS on the
  // Methodology section that follows.
  const switcherProps = {
    locale: locale as SupportedLocale,
    ariaTabsLabel: "Spending source",
    transitionHeadline: dict.transition.headline,
    sourcesDict: dict.sources,
    categoriesDict: {
      war: dict.categories.war,
      tobacco: dict.categories.tobacco,
      "fossil-fuels": dict.categories["fossil-fuels"],
      ai: dict.categories.ai,
      "food-waste": dict.categories["food-waste"],
      advertising: dict.categories.advertising,
    },
    sourcesToggle: dict.categories.sourcesToggle,
    aiBenefitLabel: dict.categories.aiBenefitLabel,
    categoryDictKeys: CATEGORY_DICT_KEYS,
  };

  return (
    <main className="min-h-screen w-full">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-12 md:py-20">
        <Suspense fallback={<SourceSwitcherView {...switcherProps} activeId="ai" />}>
          <SourceSwitcher {...switcherProps} />
        </Suspense>

        <Methodology strings={dict.methodology} />
        <Footer currentLocale={locale as Locale} yearTemplate={dict.footer.year} />
      </div>
    </main>
  );
}
