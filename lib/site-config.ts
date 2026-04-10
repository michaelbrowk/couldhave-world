/**
 * Single source of truth for the production site URL and SEO constants.
 * Imported by layout metadata, sitemap, robots, and the OG image generator.
 */

export const SITE_URL = "https://couldhave.world";
export const SITE_NAME = "couldhave.world";

/**
 * Mixpanel project token for the "Couldhave" project (id 4012175, US region).
 * Project tokens are intentionally public — they ship in the client bundle
 * and only grant write access to events for this single project, so storing
 * the value in source is the recommended pattern. NEXT_PUBLIC_MIXPANEL_TOKEN
 * env var overrides at build time if needed (e.g. for staging projects).
 */
export const MIXPANEL_TOKEN =
  process.env.NEXT_PUBLIC_MIXPANEL_TOKEN ?? "1f1fe609db704499b1cd9e2f694990cc";

/**
 * Daily version stamp appended to the og:image URL so social-media scrapers
 * (Twitter, Facebook, LinkedIn, Slack) treat each day's image as a new
 * resource and refetch instead of serving a stale cached preview. The value
 * is computed at build/render time, so a daily rebuild produces a new
 * version automatically.
 */
export function ogImageVersion(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10); // YYYY-MM-DD
}

export function ogImageUrl(now: Date = new Date()): string {
  return `${SITE_URL}/og.png?v=${ogImageVersion(now)}`;
}
