import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sdk = vi.hoisted(() => ({ init: vi.fn(), track: vi.fn() }));
vi.mock("mixpanel-browser/dist/mixpanel-core.cjs.js", () => ({ default: sdk }));

let frame: FrameRequestCallback | undefined;
let idle: IdleRequestCallback | undefined;
beforeEach(() => {
  frame = undefined;
  idle = undefined;
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((callback: FrameRequestCallback) => {
      frame = callback;
      return 1;
    }),
  );
  vi.stubGlobal(
    "requestIdleCallback",
    vi.fn((callback: IdleRequestCallback) => {
      idle = callback;
      return 1;
    }),
  );
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.resetModules();
  vi.clearAllMocks();
  vi.restoreAllMocks();
  window.history.replaceState({}, "", "/");
});

async function finishDeferredLoad() {
  await act(async () => {
    frame?.(0);
    idle?.({ didTimeout: false, timeRemaining: () => 50 });
    await vi.dynamicImportSettled();
  });
}

describe("audited analytics attribution", () => {
  it("does not schedule production analytics from local previews", async () => {
    vi.stubGlobal("window", { location: { hostname: "localhost" } });
    const { track } = await import("@/lib/mixpanel");
    track("page_view");
    expect(frame).toBeUndefined();
    expect(sdk.init).not.toHaveBeenCalled();
    expect(sdk.track).not.toHaveBeenCalled();
  });

  it("does not load or queue analytics when Do Not Track is enabled", async () => {
    vi.stubGlobal("navigator", { doNotTrack: "1" });
    const { track } = await import("@/lib/mixpanel");
    track("page_view");
    expect(frame).toBeUndefined();
    await finishDeferredLoad();
    expect(sdk.init).not.toHaveBeenCalled();
    expect(sdk.track).not.toHaveBeenCalled();
  });

  it("attributes a landing page to AI and keeps SDK loading after paint", async () => {
    const { Analytics } = await import("@/components/analytics/Analytics");
    window.history.replaceState({}, "", "/en/");
    render(<Analytics locale="en" />);
    expect(sdk.init).not.toHaveBeenCalled();
    expect(idle).toBeUndefined();
    await finishDeferredLoad();
    expect(sdk.init).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        ip: false,
        ignore_dnt: false,
        autocapture: false,
        record_sessions_percent: 0,
      }),
    );
    expect(sdk.track).toHaveBeenCalledWith(
      "page_view",
      expect.objectContaining({ initial_source: "ai" }),
    );
  });

  it("retains valid deep-link attribution", async () => {
    const { Analytics } = await import("@/components/analytics/Analytics");
    window.history.replaceState({}, "", "/en/?source=tobacco");
    render(<Analytics locale="en" />);
    await finishDeferredLoad();
    expect(sdk.track).toHaveBeenCalledWith(
      "page_view",
      expect.objectContaining({ initial_source: "tobacco" }),
    );
  });

  it("flushes early source events once, in order, with their original time", async () => {
    vi.spyOn(Date, "now").mockReturnValueOnce(100_000).mockReturnValueOnce(101_000);
    const { track, initMixpanel } = await import("@/lib/mixpanel");
    track("source_switch", { to: "tobacco", via: "url" });
    track("page_view", { initial_source: "tobacco" });
    initMixpanel();
    expect(sdk.track).not.toHaveBeenCalled();
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
    await finishDeferredLoad();
    expect(sdk.init).toHaveBeenCalledTimes(1);
    expect(sdk.track.mock.calls).toEqual([
      ["source_switch", { to: "tobacco", via: "url", time: 100 }],
      ["page_view", { initial_source: "tobacco", time: 101 }],
    ]);
    track("category_expanded", { category_id: "world-hunger" });
    expect(sdk.track).toHaveBeenLastCalledWith("category_expanded", {
      category_id: "world-hunger",
    });
    expect(sdk.init).toHaveBeenCalledTimes(1);
  });

  it("falls back to a timer when requestIdleCallback is unavailable", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    vi.stubGlobal("requestIdleCallback", undefined);
    const { track } = await import("@/lib/mixpanel");
    track("page_view");
    frame?.(0);
    await vi.advanceTimersByTimeAsync(999);
    expect(sdk.init).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    await vi.dynamicImportSettled();
    expect(sdk.init).toHaveBeenCalledTimes(1);
    expect(sdk.track).toHaveBeenCalledTimes(1);
  });

  it("discards queued events if DNT is enabled before the deferred load", async () => {
    const { track } = await import("@/lib/mixpanel");
    track("page_view");
    vi.stubGlobal("navigator", { doNotTrack: "1" });
    await finishDeferredLoad();
    expect(sdk.init).not.toHaveBeenCalled();
    expect(sdk.track).not.toHaveBeenCalled();
  });
});
