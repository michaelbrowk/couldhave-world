import { describe, expect, it } from "vitest";
import { isValidSourceId, parseSourceId } from "@/lib/sources";

describe("parseSourceId", () => {
  it("returns a valid id verbatim", () => {
    expect(parseSourceId("war")).toBe("war");
    expect(parseSourceId("tobacco")).toBe("tobacco");
    expect(parseSourceId("fossil-fuels")).toBe("fossil-fuels");
    expect(parseSourceId("ai")).toBe("ai");
  });

  it("returns null for unknown / empty / null", () => {
    expect(parseSourceId(null)).toBeNull();
    expect(parseSourceId("")).toBeNull();
    expect(parseSourceId("WAR")).toBeNull();
    expect(parseSourceId("oil")).toBeNull();
  });
});

describe("isValidSourceId", () => {
  it("narrows a string to SourceId", () => {
    const x: string = "tobacco";
    if (isValidSourceId(x)) {
      const _ok: "war" | "tobacco" | "fossil-fuels" | "ai" = x;
    }
    expect(isValidSourceId("war")).toBe(true);
    expect(isValidSourceId("xx")).toBe(false);
  });
});
