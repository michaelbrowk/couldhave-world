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
  // Keep local previews and automated browser checks out of production metrics.
  if (["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname)) return;

  mixpanel.init(MIXPANEL_TOKEN, {
    // US region is the SDK default; left explicit for clarity.
    api_host: "https://api.mixpanel.com",
    persistence: "localStorage",
    // No autocapture — we explicitly track only what we want.
    autocapture: false,
    track_pageview: false,
    // Disable IP-based geolocation enrichment and respect Do Not Track.
    ip: false,
    ignore_dnt: false,
    debug: false,
  });
  initialized = true;
}

type EventProps = Record<string, string | number | boolean | null | undefined>;

export function track(event: string, props: EventProps = {}): void {
  // A nested source switcher can mount before the layout's Analytics effect.
  // Initialize here too so its initial deep-link event is not silently lost.
  initMixpanel();
  if (!initialized || typeof window === "undefined") return;
  mixpanel.track(event, props);
}
