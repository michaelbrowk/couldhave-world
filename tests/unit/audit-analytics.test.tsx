import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const sdk = vi.hoisted(() => ({ init: vi.fn(), track: vi.fn() }));
vi.mock("mixpanel-browser", () => ({ default: sdk }));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.resetModules();
  vi.clearAllMocks();
  window.history.replaceState({}, "", "/");
});

describe("audited analytics attribution", () => {
  it("does not pollute production analytics from local previews", async () => {
    vi.stubGlobal("window", { location: { hostname: "localhost" } });
    const { track } = await import("@/lib/mixpanel");
    track("page_view");
    expect(sdk.init).not.toHaveBeenCalled();
    expect(sdk.track).not.toHaveBeenCalled();
  });
  it("attributes a plain landing page to AI and disables geolocation enrichment", async () => {
    const { Analytics } = await import("@/components/analytics/Analytics");
    window.history.replaceState({}, "", "/en/");
    render(<Analytics locale="en" />);
    expect(sdk.init).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ ip: false, ignore_dnt: false, autocapture: false }),
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
    expect(sdk.track).toHaveBeenCalledWith(
      "page_view",
      expect.objectContaining({ initial_source: "tobacco" }),
    );
  });

  it("keeps initial source events even when the source component mounts first", async () => {
    const { track } = await import("@/lib/mixpanel");
    track("source_switch", { to: "tobacco", via: "url" });
    expect(sdk.init).toHaveBeenCalledTimes(1);
    expect(sdk.track).toHaveBeenCalledWith("source_switch", { to: "tobacco", via: "url" });
  });
});
