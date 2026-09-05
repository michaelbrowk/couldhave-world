import { describe, expect, it } from "vitest";
import { SOURCES } from "@/data/sources.index";

const findCat = (sid: string, cid: string) =>
  SOURCES[sid as keyof typeof SOURCES].categories.find((c) => c.id === cid);

describe("canonical shared alternatives", () => {
  it("clean-water is the drinking-water-only figure ($37.6B) in every tab that uses it", () => {
    for (const sid of ["war", "tobacco", "ai"]) {
      expect(findCat(sid, "clean-water")?.unitCostUsd, sid).toBe(37_600_000_000);
    }
  });
  it("child-vaccination is the IA2030 model average ($26.98B) in war and tobacco", () => {
    for (const sid of ["war", "tobacco"]) {
      expect(findCat(sid, "child-vaccination")?.unitCostUsd, sid).toBe(26_980_000_000);
    }
  });
  it("does not convert a PPP poverty gap directly to USD", () => {
    expect(findCat("war", "extreme-poverty")).toBeUndefined();
  });
  it("world-hunger keeps $33B but no longer cites the wheat-yield DOI", () => {
    for (const sid of ["war", "tobacco", "fossil-fuels", "ai"]) {
      const c = findCat(sid, "world-hunger");
      expect(c?.unitCostUsd, sid).toBe(33_000_000_000);
      expect(
        c?.sources.some((s) => s.url.includes("s43016-020-00181-w")),
        sid,
      ).toBe(false);
    }
  });
});
