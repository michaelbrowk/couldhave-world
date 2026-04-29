import mixpanel from "mixpanel-browser";
import { MIXPANEL_TOKEN } from "./site-config";

let initialized = false;

/**
 * Idempotent Mixpanel initializer. Safe to call multiple times — only the
 * first call boots the SDK. No-op if MIXPANEL_TOKEN is empty (e.g. when a
 * fork builds without the env var set).
 */
export function initMixpanel(): void {
  if (initialized || typeof window === "undefined") return;
  if (!MIXPANEL_TOKEN) return;

  mixpanel.init(MIXPANEL_TOKEN, {
    // US region is the SDK default; left explicit for clarity.
    api_host: "https://api.mixpanel.com",
    persistence: "localStorage",
    // No autocapture — we explicitly track only what we want.
    track_pageview: false,
    // Privacy: do not capture IP-based geolocation as a personal property.
    // (Mixpanel still uses IP for the basic City/Country properties; we
    // tolerate that as standard analytics, no PII beyond country level.)
    ignore_dnt: false,
    debug: false,
  });
  initialized = true;
}

type EventProps = Record<string, string | number | boolean | null | undefined>;

export function track(event: string, props: EventProps = {}): void {
  if (!initialized || typeof window === "undefined") return;
  mixpanel.track(event, props);
}
