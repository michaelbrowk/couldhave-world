import type { Mixpanel } from "mixpanel-browser";
import { MIXPANEL_TOKEN } from "./site-config";

type EventProps = Record<string, string | number | boolean | null | undefined>;
type PendingEvent = { event: string; props: EventProps };

let sdk: Mixpanel | undefined;
let scheduled = false;
const pending: PendingEvent[] = [];
const MAX_PENDING_EVENTS = 100;

function mayTrack(): boolean {
  if (typeof window === "undefined" || !MIXPANEL_TOKEN) return false;
  if (["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname)) return false;
  const nav = window.navigator as Navigator & { msDoNotTrack?: unknown };
  const legacyWindow = window as Window & { doNotTrack?: unknown };
  return ![nav?.doNotTrack, nav?.msDoNotTrack, legacyWindow.doNotTrack].some(
    (value) => value === true || value === 1 || value === "1" || value === "yes",
  );
}

async function loadSdk(): Promise<void> {
  try {
    if (!mayTrack()) {
      pending.length = 0;
      return;
    }
    // The core build excludes session recording, which this site never uses.
    // Its separate chunk is requested only after the initial page has painted.
    const { default: mixpanel } = await import("mixpanel-browser/dist/mixpanel-core.cjs.js");
    if (!mayTrack()) {
      pending.length = 0;
      return;
    }
    mixpanel.init(MIXPANEL_TOKEN, {
      api_host: "https://api.mixpanel.com",
      persistence: "localStorage",
      autocapture: false,
      track_pageview: false,
      record_sessions_percent: 0,
      ip: false,
      ignore_dnt: false,
      debug: false,
    });
    sdk = mixpanel;
    for (const queued of pending.splice(0)) sdk.track(queued.event, queued.props);
  } catch {
    // A blocked or failed analytics download must not break the page. A later
    // explicit event may retry; the bounded queue retains its original times.
  } finally {
    scheduled = false;
  }
}

/** Idempotently schedule noncritical analytics after a frame, then idle time. */
export function initMixpanel(): void {
  if (!mayTrack() || sdk || scheduled) return;
  scheduled = true;
  const afterPaint = () => {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(() => void loadSdk(), { timeout: 2000 });
    } else {
      window.setTimeout(() => void loadSdk(), 1000);
    }
  };
  if (typeof window.requestAnimationFrame === "function") {
    window.requestAnimationFrame(afterPaint);
  } else {
    window.setTimeout(afterPaint, 0);
  }
}

export function track(event: string, props: EventProps = {}): void {
  if (!mayTrack()) {
    pending.length = 0;
    return;
  }
  if (sdk) {
    sdk.track(event, props);
    return;
  }
  if (pending.length < MAX_PENDING_EVENTS) {
    pending.push({ event, props: { time: Math.floor(Date.now() / 1000), ...props } });
  }
  // Deep-link events may arrive before the layout's Analytics effect.
  initMixpanel();
}
