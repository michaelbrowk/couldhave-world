import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";

// Required when output: 'export' — tells Next.js to render this route at
// build time and emit a static robots.txt file rather than treating it as
// a dynamic handler.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
