import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SourceSwitcher, SourceSwitcherView } from "@/components/sources/SourceSwitcher";
import { Footer } from "@/components/layout/Footer";
import { Methodology } from "@/components/layout/Methodology";
import { type Locale, CATEGORY_DICT_KEYS, getDictionary, hasLocale } from "./dictionaries";
import type { SupportedLocale } from "@/lib/formatters";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dict = await getDictionary(locale);

  // Both branches share these props. The Suspense fallback bakes the
  // default 'war' state into the static HTML; the real SourceSwitcher
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
    },
    sourcesToggle: dict.categories.sourcesToggle,
    categoryDictKeys: CATEGORY_DICT_KEYS,
  };

  return (
    <main className="min-h-screen w-full">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-12 md:py-20">
        <Suspense fallback={<SourceSwitcherView {...switcherProps} activeId="war" />}>
          <SourceSwitcher {...switcherProps} />
        </Suspense>

        <Methodology strings={dict.methodology} />
        <Footer currentLocale={locale as Locale} yearTemplate={dict.footer.year} />
      </div>
    </main>
  );
}
