import type { Metadata } from "next";
import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { Analytics } from "@/components/analytics/Analytics";
import { militarySpending } from "@/data/military-spending.schema";
import { ogImageUrl, SITE_NAME, SITE_URL } from "@/lib/site-config";
import "../globals.css";
import { getDictionary, hasLocale, interpolate, LOCALES, type Locale } from "./dictionaries";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-mono",
  display: "swap",
});

const OG_LOCALE_MAP: Record<Locale, string> = {
  en: "en_US",
  es: "es_ES",
  de: "de_DE",
  fr: "fr_FR",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};

  const dict = await getDictionary(locale);
  const { currentYear, projection } = militarySpending;

  // Title is the transition headline ("Instead, this money could have…").
  // Description is the live methodology line with year + basedOnYear filled in.
  const title = dict.transition.headline;
  const description = interpolate(dict.hero.methodology, {
    year: currentYear,
    basedOnYear: projection.basedOnYear,
  });

  const canonical = `${SITE_URL}/${locale}/`;
  const ogImage = ogImageUrl();

  // hreflang map: every locale lists all locales' URLs so search engines can
  // serve the right one to the right user.
  const languages: Record<string, string> = {};
  for (const loc of LOCALES) {
    languages[loc] = `${SITE_URL}/${loc}/`;
  }
  languages["x-default"] = `${SITE_URL}/en/`;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    applicationName: SITE_NAME,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      siteName: SITE_NAME,
      locale: OG_LOCALE_MAP[locale],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const { currentYear, projection } = militarySpending;
  const description = interpolate(dict.hero.methodology, {
    year: currentYear,
    basedOnYear: projection.basedOnYear,
  });

  // Schema.org JSON-LD: declare the page as a WebSite, link to all locale
  // alternates, and credit SIPRI as the upstream data source. Helps Google
  // generate richer search results and connect the four locale pages as
  // translations of one work.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: `${SITE_URL}/${locale}/`,
    description,
    inLanguage: locale,
    isAccessibleForFree: true,
    license: "https://opensource.org/license/mit/",
    isBasedOn: {
      "@type": "Dataset",
      name: "SIPRI Military Expenditure Database",
      url: militarySpending.sourceUrl,
      creator: {
        "@type": "Organization",
        name: "Stockholm International Peace Research Institute",
      },
    },
  };

  return (
    <html
      lang={locale}
      className={`${instrumentSerif.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-[var(--bg)] text-[var(--text-primary)] font-sans antialiased">
        {children}
        <Analytics locale={locale} />
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires raw JSON
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
