import type { MetadataRoute } from "next";
import { LOCALES } from "@/app/[locale]/dictionaries";
import { militarySpending } from "@/data/military-spending.schema";
import { SITE_URL } from "@/lib/site-config";

// Required for static export — render the sitemap once at build time.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  // The site has one canonical entry per locale; lastModified is the SIPRI
  // data update date so search engines see a fresh signal whenever the
  // numbers change.
  const lastModified = new Date(militarySpending.lastUpdated);

  return LOCALES.map((locale) => ({
    url: `${SITE_URL}/${locale}/`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: locale === "en" ? 1 : 0.9,
    alternates: {
      languages: Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}/${l}/`])),
    },
  }));
}
