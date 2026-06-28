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
  it("child-vaccination is the every-child figure ($27B) in war and tobacco", () => {
    for (const sid of ["war", "tobacco"]) {
      expect(findCat(sid, "child-vaccination")?.unitCostUsd, sid).toBe(27_000_000_000);
    }
  });
  it("extreme-poverty uses the $3/day shortfall ($315B) in war", () => {
    expect(findCat("war", "extreme-poverty")?.unitCostUsd).toBe(315_000_000_000);
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
